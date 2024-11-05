import UIKit
import Starscream
import AVFoundation

public class ElevenLabsSDK: ObservableObject {
    public static let shared = ElevenLabsSDK()
    
    // MARK: - Published Properties
    @Published public private(set) var connectionStatus: ConnectionStatus = .disconnected
    @Published public private(set) var currentMode: ConversationMode = .listening
    @Published public private(set) var audioLevel: Float = 0.0
    
    // MARK: - Internal Properties
    fileprivate let inputAudioManager: InputAudioManager
    fileprivate let conversationManager: ConversationManager
    private var configuration: Configuration?
    
    // MARK: - Initialization
    private init() {
        self.inputAudioManager = InputAudioManager(sdk: nil)
        self.conversationManager = ConversationManager(inputAudioManager: inputAudioManager)
        
        self.inputAudioManager.sdk = self
        
        setupBindings()
    }
    
    // MARK: - Mode Management
    fileprivate func updateConversationMode(_ mode: ConversationMode) {
        DispatchQueue.main.async {
            self.currentMode = mode
        }
    }
    
    // MARK: - Public Methods
    public func configure(with config: Configuration) {
        self.configuration = config
        conversationManager.configure(agentId: config.agentId)
    }
    
    public func startConversation() {
        guard configuration != nil else {
            print("Error: SDK must be configured before starting conversation")
            return
        }
        conversationManager.startSession()
        inputAudioManager.startRecordAudio()
    }
    
    public func endConversation() {
        inputAudioManager.pauseCaptureAudio()
        conversationManager.endSession()
    }
    
    // MARK: - Private Methods
    private func setupBindings() {
        // Bind conversation manager status to SDK status
        conversationManager.$status
            .assign(to: &$connectionStatus)
        
        // Bind audio manager level to SDK audio level
        inputAudioManager.$currentAudioLevel
            .assign(to: &$audioLevel)
    }
}

// MARK: - ElevenLabsSDK Types
extension ElevenLabsSDK {
    public enum ConnectionStatus: String {
        case disconnected, connecting, connected, disconnecting
    }
    
    public enum ConversationMode: String {
        case speaking, listening
    }
    
    public enum ConversationRole: String {
        case user, ai
    }
    
    public struct Configuration {
        let agentId: String
        
        public init(agentId: String) {
            self.agentId = agentId
        }
    }
}

// MARK: - Conversation Manager
private class ConversationManager: NSObject, WebSocketDelegate, ObservableObject {
    static var shared: ConversationManager?
    
    @Published private(set) var status: ElevenLabsSDK.ConnectionStatus = .disconnected
    private(set) var socket: WebSocket?
    private var agentId: String?
    private let inputAudioManager: InputAudioManager
    
    private let baseWSURL = "wss://api.elevenlabs.io/v1/convai/conversation?agent_id="
    
    func configure(agentId: String) {
        self.agentId = agentId
    }
    init(inputAudioManager: InputAudioManager) {
        self.inputAudioManager = inputAudioManager
        super.init()
        ConversationManager.shared = self
    }
    
    func startSession() {
        guard let agentId = agentId else { return }
        
        status = .connecting
        let request = URLRequest(url: URL(string: "\(baseWSURL)\(agentId)")!)
        socket = WebSocket(request: request)
        socket?.delegate = self
        socket?.connect()
    }
    
    func endSession() {
        status = .disconnecting
        guard let socket = socket else { return }
        
        PlaybackAudioManager.shared.audio_event_Queue.removeAll()
        

        socket.disconnect()
        self.socket = nil
        
        DispatchQueue.main.async {
            self.status = .disconnected
        }
    }
    
    func didReceive(event: WebSocketEvent, client: WebSocketClient) {
        switch event {
        case .connected(_):
            status = .connected
        case .disconnected(_, _):
            status = .disconnected
        case .text(let string):
            handleWebSocketMessage(string)
        case .binary(_):
            break
        case .error(let error):
            status = .disconnected
            print("WebSocket error: \(String(describing: error))")
        default:
            break
        }
    }
    
    private func handleWebSocketMessage(_ message: String) {
        if let jsonData = message.data(using: .utf8) {
            do {
                if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any],
                   let type = jsonObject["type"] as? String{
                    switch type {
                    case "conversation_initiation_metadata":
                        // configure the audio format
                        if let metadata = jsonObject["conversation_initiation_metadata_event"] as? [String: Any],
                          let audioFormat = metadata["agent_output_audio_format"] as? String {
                           // Configure audio manager with the correct format
                            PlaybackAudioManager.shared.configureAudioFormat(format: audioFormat)
                       }
                        
                        self.status = .connected
                        inputAudioManager.startRecordAudio()
                        ElevenLabsSDK.shared.updateConversationMode(.listening)
                    case "interruption":
                        // if interrupted by the user, stop talking.
                        PlaybackAudioManager.shared.audio_event_Queue.removeAll()
                        ElevenLabsSDK.shared.updateConversationMode(.listening)
                    case "agent_response":
                        print("agent_response: \(jsonObject)")
                    case "user_transcript":
                        print("user_transcript: \(jsonObject)")
                    case "audio":
                        guard let audioEvent = jsonObject["audio_event"] as? [String: Any],
                              let audioBase64 = audioEvent["audio_base_64"] as? String else {
                            print("Invalid audio event format")
                            return
                        }
                        ElevenLabsSDK.shared.updateConversationMode(.speaking)
                        let audioEventInfo: [String: Any] = [
                            "delta": audioBase64,
                            "index": PlaybackAudioManager.shared.audio_event_Queue.count
                        ]
                        PlaybackAudioManager.shared.playAudio(eventInfo: audioEventInfo)
                    case "ping":
                        print("ping: \(jsonObject)")
                    default:
                        break;
                    }
                    
                    if type == "error"{
                        print("error: \(jsonObject)")
                    }
                }
            } catch {
                print("JSON Handled Error: \(error.localizedDescription)")
            }
        }
    }
}

// MARK: - Audio Manager
fileprivate class InputAudioManager: NSObject, ObservableObject {
    // MARK: - Published Properties
    @Published private(set) var currentAudioLevel: Float = 0.0
    
    private static var sharedAudioUnit: AudioUnit?
    private static var local_record_buffers = [AVAudioPCMBuffer]()
    
    // MARK: - Properties
    fileprivate weak var sdk: ElevenLabsSDK?
    private var audioUnit: AudioUnit?
    private var recordBuffers = [AVAudioPCMBuffer]()
    private var recordArray = [[String: Any]]()
    private var messageCount = 0
    private var local_record_Array = [[String: Any]]()
    
    // Add a static variable to store the shared instance
    private static var shared: InputAudioManager?
    
    // MARK: - Initialization
    init(sdk: ElevenLabsSDK?) {
        self.sdk = sdk
        super.init()
        InputAudioManager.shared = self
    }
    
    //MARK: Start collecting audio data.
    func startRecordAudio(){
        if audioUnit != nil{
            AudioOutputUnitStart(audioUnit!)
            return
        }
        // check microphone permissions
        AVAudioApplication.requestRecordPermission { granted in
            DispatchQueue.main.async {
                if granted {
                    print("The user has granted microphone permission.")
                } else {
                    print("The user denies microphone permission.")
                }
            }
        }
        
        // instantiate session
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
            try audioSession.setActive(true)
            print("AVAudioSession1: Instantiated Successfully")
        } catch {
            print("AVAudioSession1: Error instantiating: \(error)")
        }
        
        // initialise
        var audioComponentDesc = AudioComponentDescription()
        
        // categorise audio components
        audioComponentDesc.componentType = kAudioUnitType_Output
        audioComponentDesc.componentSubType = kAudioUnitSubType_VoiceProcessingIO // echo cancellation
        audioComponentDesc.componentManufacturer = kAudioUnitManufacturer_Apple
        audioComponentDesc.componentFlags = 0
        audioComponentDesc.componentFlagsMask = 0
        
        guard let audioComponent = AudioComponentFindNext(nil, &audioComponentDesc) else {
            print("Failed to find audio unit")
            return
        }
        AudioComponentInstanceNew(audioComponent, &audioUnit)
        guard let audioUnit = audioUnit else {
            print("Failed to find created audio unit instance")
            return
        }
        
        // define the input pipeline.
        var enableIO: UInt32 = 1
        _ = AudioUnitSetProperty(audioUnit,
                                 kAudioOutputUnitProperty_EnableIO,
                                 kAudioUnitScope_Input,
                                 1,
                                 &enableIO,
                                 UInt32(MemoryLayout.size(ofValue: enableIO)))
        
        // sample rate must be 16,000 to match websocket pcm_16000
        var audioFormat = AudioStreamBasicDescription(
            mSampleRate: 16000,
            mFormatID: kAudioFormatLinearPCM,
            mFormatFlags: kAudioFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked,
            mBytesPerPacket: 2,
            mFramesPerPacket: 1,
            mBytesPerFrame: 2,
            mChannelsPerFrame: 1,
            mBitsPerChannel: 16,
            mReserved: 0
        )
        AudioUnitSetProperty(audioUnit,
                             kAudioUnitProperty_StreamFormat,
                             kAudioUnitScope_Output,
                             1, // bus
                             &audioFormat,
                             UInt32(MemoryLayout<AudioStreamBasicDescription>.size)
        )
        
        // enable input callback
        var inputCallbackStruct = AURenderCallbackStruct(
            inputProc: inputRenderCallback,
            inputProcRefCon: UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque())
        )
        AudioUnitSetProperty(audioUnit,
                             kAudioOutputUnitProperty_SetInputCallback,
                             kAudioUnitScope_Global,
                             1,
                             &inputCallbackStruct,
                             UInt32(MemoryLayout<AURenderCallbackStruct>.size))
        
        // set the output pipeline
        var enable_out: UInt32 = 0
        let _ = AudioUnitSetProperty(audioUnit,
                                     kAudioOutputUnitProperty_EnableIO,
                                     kAudioUnitScope_Output,
                                     0,
                                     &enable_out,
                                     UInt32(MemoryLayout.size(ofValue: enable_out)))
        // initialise and start
        if AudioUnitUninitialize(audioUnit) == noErr {
            print("Audio Unit: Instantiated Successfully")
            if AudioOutputUnitStart(audioUnit) == noErr{
                print("Audio Unit: Started Successfully")
            }else{
                print("Audio Unit: Failed to start")
            }
        }else{
            print("Audio Unit: Failed to instantiated")
        }
    }
    
    //MARK: Process the collected audio data.
    var count  = 0
    let inputRenderCallback: AURenderCallback = { (
        inRefCon,
        ioActionFlags,
        inTimeStamp,
        inBusNumber,
        inNumberFrames,
        ioData
    ) -> OSStatus in
        guard let audioUnit = InputAudioManager.shared?.audioUnit else {
            return noErr // Return early if we don't have a valid audio unit
        }
        
        var bufferList = AudioBufferList(
            mNumberBuffers: 1,
            mBuffers: AudioBuffer(
                mNumberChannels: 1,
                mDataByteSize: inNumberFrames * 2,
                mData: UnsafeMutableRawPointer.allocate(byteCount: Int(inNumberFrames) * 2, alignment: MemoryLayout<Int16>.alignment)
            )
        )
        
        let status = AudioUnitRender(audioUnit,  // Use the unwrapped audioUnit
                                     ioActionFlags,
                                     inTimeStamp,
                                     inBusNumber,
                                     inNumberFrames,
                                     &bufferList)
        
        if status == noErr {
            let inputData = bufferList.mBuffers.mData?.assumingMemoryBound(to: Int16.self)
            let frameCount = Int(inNumberFrames)
            var int16_array: [Int16] = []
            for frame in 0..<frameCount {
                let sample = inputData?[frame] ?? 0
                int16_array.append(sample)
            }
            if let buffer = int16DataToPCMBuffer(int16Data: int16_array, sampleRate: Double(16000), channels: 1){
                InputAudioManager.local_record_buffers.append(buffer)
            }
            
            //[int16]-->Data
            let pcmData = Data(bytes: int16_array, count: int16_array.count * MemoryLayout<Int16>.size)
            //Data-->Base64String
            let data_base64 = pcmData.base64EncodedString()
            //Send Message
            
            let current_audio_data: [String: Any] = ["type": "user_audio_chunk",
                                                     "user_audio_chunk": data_base64]
            
            if let shared = InputAudioManager.shared {
                shared.local_record_Array.append(current_audio_data)
                if shared.count == 0 || shared.local_record_Array.count == 1 {
                    shared.sendMessageOneByOne()
                }
                shared.count += 1
            }
            
            //Monitor Audio Volume Data
            //RMS：0（min）-1(max)
            var rmsValue: Float = 0.0
            for frame in 0..<frameCount {
                let sample = inputData?[frame] ?? 0
                int16_array.append(sample)
                let normalizedSample = Float(sample) / Float(Int16.max)
                rmsValue += normalizedSample * normalizedSample
            }
            rmsValue = sqrt(rmsValue / Float(frameCount))
            
            // Update the audio level on the main thread
            DispatchQueue.main.async {
                if let inputManager = InputAudioManager.shared {
                    inputManager.currentAudioLevel = rmsValue
                }
            }
            
        } else {
            print("AudioUnitRender failed with status: \(status)")
        }
        return noErr
    }
    func sendMessageOneByOne(){
        if self.local_record_Array.count <= 0{
            return
        }
        let firstEventInfo = self.local_record_Array[0]
        if let audioChunk = firstEventInfo["user_audio_chunk"] as? String,
           let type = firstEventInfo["type"] as? String {
            
            let event: [String: Any] = [
                "type": type,
                "user_audio_chunk": audioChunk
            ]
            
            if let jsonData = try? JSONSerialization.data(withJSONObject: event, options: []),
               let jsonString = String(data: jsonData, encoding: .utf8){
                ConversationManager.shared?.socket?.write(string: jsonString) {
                    if self.local_record_Array.count > 0{
                        self.local_record_Array.removeFirst()
                        self.sendMessageOneByOne()
                        
                    }
                }
            }
        }
    }
    // MARK: Pause audio capture
    func pauseCaptureAudio(){
        DispatchQueue.main.async {
            guard let audioUnit = self.audioUnit else{return}
            if AudioOutputUnitStop(audioUnit) == noErr{
                print("Pause AudioUnit Success")
            }else{
                print("Pause AudioUnit Fail")
            }
        }
    }
    
}

class PlaybackAudioManager: NSObject {
    static let shared = PlaybackAudioManager()
    private var currentSampleRate: Double = 16000 // Default sample rate
    private var isUlaw: Bool = false // Track if we're using μ-law format
      
    private override init(){
        super.init()
        setupAudioEngine()
    }
    
    func configureAudioFormat(format: String) {
         // Use regex to parse format string
         let pcmPattern = #"pcm_(\d+)"#
         let ulawPattern = #"ulaw_(\d+)"#
         
         if let pcmMatch = format.range(of: pcmPattern, options: .regularExpression),
            let sampleRate = Double(format[pcmMatch].replacingOccurrences(of: "pcm_", with: "")) {
             currentSampleRate = sampleRate
             isUlaw = false
             setupAudioEngine() // Reinitialize with new sample rate
         } else if let ulawMatch = format.range(of: ulawPattern, options: .regularExpression),
                   let sampleRate = Double(format[ulawMatch].replacingOccurrences(of: "ulaw_", with: "")) {
             currentSampleRate = sampleRate
             isUlaw = true
             setupAudioEngine() // Reinitialize with new sample rate
         } else {
             print("Unsupported audio format: \(format), defaulting to pcm_16000")
             currentSampleRate = 16000
             isUlaw = false
             setupAudioEngine()
         }
     }
    
    func setupAudioEngine() {
        audioEngine = AVAudioEngine()
        playerNode = AVAudioPlayerNode()
        
        let timePitchNode = AVAudioUnitTimePitch()
        timePitchNode.rate = 1
        audioEngine.attach(playerNode)
        audioEngine.attach(timePitchNode)
        
        audioFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: currentSampleRate, channels: 1, interleaved: false)
        audioEngine.connect(playerNode, to: timePitchNode, format: audioFormat)
        audioEngine.connect(timePitchNode, to: audioEngine.mainMixerNode, format: audioFormat)
        
        try? audioEngine.start()
        playerNode.play()
    }
    
    var isPauseAudio = false
    var audioEngine: AVAudioEngine!
    var playerNode: AVAudioPlayerNode!
    var audioFormat: AVAudioFormat!
    var audio_event_Queue = [[String: Any]]()
    
    func playAudio(eventInfo: [String: Any]) {
        audio_event_Queue.append(eventInfo)
        if audio_event_Queue.count == 1 {
            playNextAudio()
        }
    }
    
    private func playNextAudio() {
        if(isUlaw){
            print("Ulaw audio format is not supported")
            return
        }
        if isPauseAudio{
            ElevenLabsSDK.shared.updateConversationMode(.listening)
            return
        }
        if audio_event_Queue.count <= 0 {
            ElevenLabsSDK.shared.updateConversationMode(.listening)
            return
        }
        ElevenLabsSDK.shared.updateConversationMode(.speaking)
        let firstAudioInfo = audio_event_Queue[0]
        let base64String = firstAudioInfo["delta"] as? String ?? ""
    
        guard let pcmData = Data(base64Encoded: base64String) else {
            audio_event_Queue.removeFirst()
            playNextAudio()
            return
        }
        
        let int16Count = pcmData.count / MemoryLayout<Int16>.size
        let frameCapacity = int16Count
        guard let buffer = AVAudioPCMBuffer(pcmFormat: audioFormat, frameCapacity: AVAudioFrameCount(frameCapacity)) else {
            audio_event_Queue.removeFirst()
            playNextAudio()
            return
        }
        buffer.frameLength = AVAudioFrameCount(frameCapacity)
        
        pcmData.withUnsafeBytes { rawBufferPointer in
            guard let int16Pointer = rawBufferPointer.baseAddress?.assumingMemoryBound(to: Int16.self) else {
                return
            }
            
            //Increase the volume by two times.
            var audioSamples: [Int16] = Array(UnsafeBufferPointer(start: int16Pointer, count: frameCapacity))
            let amplificationFactor: Float = 3.0  //Amplification factor
            let maxAmplitude: Int16 = Int16.max
            let minAmplitude: Int16 = Int16.min
            for i in 0..<audioSamples.count {
                let amplifiedSample = Float(audioSamples[i]) * amplificationFactor
                if amplifiedSample > Float(maxAmplitude) {
                    audioSamples[i] = maxAmplitude
                } else if amplifiedSample < Float(minAmplitude) {
                    audioSamples[i] = minAmplitude
                } else {
                    audioSamples[i] = Int16(amplifiedSample)
                }
            }
            //Float32-->Int16
            let floatPointer = buffer.floatChannelData?[0]
            for i in 0..<int16Count {
                floatPointer?[i] = Float(audioSamples[i]) / 32768.0
            }
        }
        playerNode.scheduleBuffer(buffer) {
            if self.audio_event_Queue.count > 0{
                self.audio_event_Queue.removeFirst()
            }
            if self.audio_event_Queue.isEmpty {
                       ElevenLabsSDK.shared.updateConversationMode(.listening)
            }
            self.playNextAudio()
        }
    }
    
}

// Helper function
func int16DataToPCMBuffer(int16Data: [Int16], sampleRate: Double, channels: AVAudioChannelCount) -> AVAudioPCMBuffer? {
    let audioFormat = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: sampleRate, channels: channels, interleaved: false)
    let frameLength = UInt32(int16Data.count) / channels
    guard let pcmBuffer = AVAudioPCMBuffer(pcmFormat: audioFormat!, frameCapacity: frameLength) else {
        print("Can't create AVAudioPCMBuffer")
        return nil
    }
    pcmBuffer.frameLength = frameLength
    if let channelData = pcmBuffer.int16ChannelData {
        for channel in 0..<Int(channels) {
            let channelPointer = channelData[channel]
            let samplesPerChannel = int16Data.count / Int(channels)
            for sampleIndex in 0..<samplesPerChannel {
                channelPointer[sampleIndex] = int16Data[sampleIndex * Int(channels) + channel]
            }
        }
    }
    return pcmBuffer
}




