import SwiftUI
import AVFoundation
import UniformTypeIdentifiers
import AppKit // Added for opening URLs

struct GeneratedSpeechItem: Identifiable {
    let id = UUID()
    let audioURL: URL
    let text: String
    let voiceName: String
    let createdAt: Date
    let fileName: String
}

class AudioPlayerViewModel: NSObject, ObservableObject, AVAudioPlayerDelegate {
    @Published var isPlaying = false
    private var audioPlayer: AVAudioPlayer?
    
    override init() {
        super.init()
    }
    
    func togglePlayPause(for url: URL) {
        if let player = audioPlayer, player.isPlaying {
            player.pause()
            isPlaying = false
        } else {
            do {
                audioPlayer = try AVAudioPlayer(contentsOf: url)
                audioPlayer?.delegate = self
                audioPlayer?.play()
                isPlaying = true
            } catch {
                print("Error setting up audio player: \(error.localizedDescription)")
            }
        }
    }
    
    func stop() {
        audioPlayer?.stop()
        audioPlayer = nil
        isPlaying = false
    }
    
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        DispatchQueue.main.async {
            self.isPlaying = false
        }
    }
}

struct Model: Codable, Identifiable, Hashable {
    let modelId: String
    let name: String
    
    var id: String { modelId }
    
    enum CodingKeys: String, CodingKey {
        case modelId = "model_id"
        case name
    }
}

struct ContentView: View {
    @EnvironmentObject var appDelegate: AppDelegate
    @State private var inputText = ""
    @State private var selectedVoice: Voice?
    @State private var models: [Model] = []
    @State private var selectedModel: Model?
    @State private var generatedItems: [GeneratedSpeechItem] = []
    @State private var isGenerating = false
    @State private var voices: [Voice] = []
    @State private var errorMessage: String?
    @State private var contentHeight: CGFloat = 0
    @State private var showingSettings = false
    @State private var apiKey: String = UserDefaults.standard.string(forKey: "ElevenLabsAPIKey") ?? ""
    @State private var isFirstLaunch = UserDefaults.standard.string(forKey: "ElevenLabsAPIKey") == nil
    
    var body: some View {
        VStack(spacing: 0) {
            // Main content (stays fixed)
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    // ElevenLabs logo
                    Image("elevenlabslogo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 71, height: 9)
                        .onTapGesture {
                            openElevenLabsWebsite()
                        }
                    
                    Spacer()
                    
                    // Settings icon
                    Button(action: { showingSettings = true }) {
                        Image(systemName: "gear")
                            .foregroundColor(.black)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(.top, 12)
                .padding(.horizontal, 4)
                .padding(.bottom, 16)
                
                TextEditor(text: $inputText)
                    .frame(height: 100)
                    .font(.system(size: 14))
                    .background(Color(NSColor.textBackgroundColor))
                    .cornerRadius(8)
                
                HStack(spacing: 12) {
                    CustomPicker(selection: $selectedVoice, options: voices, placeholder: "Adam", iconType: .voiceIcon) { voice in
                        Text(voice.name.prefix(20))
                    }
                    
                    CustomPicker(selection: $selectedModel, options: models, placeholder: "Select Model", iconType: .modelIcon) { model in
                        Text(model.name)
                    }
                }
                
                Button(action: generateSpeech) {
                    HStack {
                        Image(systemName: "waveform")
                        Text("Generate speech")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.black)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .buttonStyle(PlainButtonStyle())
                .disabled(inputText.isEmpty || isGenerating || selectedVoice == nil)
                .padding(.bottom, 16)
            }
            .padding(.top, 8)
            .padding(.horizontal, 16)
            .background(Color.white)
            
            // Expandable content
            VStack(spacing: 8) {
                if isGenerating {
                    ProgressView()
                        .frame(height: 60)
                        .frame(maxWidth: .infinity)
                        .background(Color.white)
                }
                
                ForEach(generatedItems.prefix(5)) { item in
                    AudioPlayerView(item: item)
                }
                
                if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .padding()
                        .background(Color.white)
                }
            }
            .padding(.horizontal, 8) // Add 8px padding to both edges
            .padding(.bottom, 16) // Keep the bottom padding
            .background(GeometryReader { geometry in
                Color.clear.preference(key: ViewHeightKey.self, value: geometry.size.height)
            })
        }
        .frame(width: 360)
        .background(Color.white)
        .onPreferenceChange(ViewHeightKey.self) { height in
            let newHeight = height + (isGenerating ? 60 : 0)
            if newHeight != contentHeight {
                withAnimation(.easeInOut(duration: 0.3)) {
                    contentHeight = newHeight
                    appDelegate.updatePopoverHeight(height: newHeight)
                }
            }
        }
        .onChange(of: isGenerating) { _, _ in updateContentHeight() }
        .onChange(of: generatedItems.count) { _, _ in updateContentHeight() }
        .onChange(of: errorMessage) { _, _ in updateContentHeight() }
        .onAppear {
            if !isFirstLaunch {
                fetchVoices()
                fetchModels()
            }
        }
        .sheet(isPresented: Binding(
            get: { showingSettings || isFirstLaunch },
            set: { newValue in
                showingSettings = newValue
                isFirstLaunch = newValue && isFirstLaunch
            }
        )) {
            SettingsView(apiKey: $apiKey, isPresented: $showingSettings, isFirstLaunch: $isFirstLaunch)
        }
        .onChange(of: apiKey) { _, newValue in
            UserDefaults.standard.set(newValue, forKey: "ElevenLabsAPIKey")
            ElevenLabsAPI.shared.updateAPIKey(newValue)
            fetchVoices()
            fetchModels()
        }
    }
    
    private func updateContentHeight() {
        contentHeight += 0.1
    }
    
    func fetchVoices() {
        ElevenLabsAPI.shared.fetchVoices { fetchedVoices in
            if fetchedVoices.isEmpty {
                self.errorMessage = "Failed to fetch voices. Please check your API key and internet connection."
            } else {
                self.voices = fetchedVoices
                self.selectedVoice = fetchedVoices.first
                self.errorMessage = nil
            }
        }
    }
    
    func fetchModels() {
        ElevenLabsAPI.shared.fetchModels { fetchedModels in
            if fetchedModels.isEmpty {
                self.errorMessage = "Failed to fetch models. Please check your API key and internet connection."
            } else {
                self.models = fetchedModels
                if let defaultModel = fetchedModels.first(where: { $0.modelId == "eleven_turbo_v2_5" }) {
                    self.selectedModel = defaultModel
                } else {
                    self.selectedModel = fetchedModels.first
                }
            }
        }
    }
    
    func generateSpeech() {
        guard let voice = selectedVoice, let model = selectedModel else { return }
        
        isGenerating = true
        let currentText = inputText
        let fileName = "speech_\(Date().timeIntervalSince1970).mp3"
        
        ElevenLabsAPI.shared.generateSpeech(text: currentText, voiceID: voice.voice_id, modelID: model.modelId) { tempURL in
            DispatchQueue.main.async {
                self.isGenerating = false
                if let tempURL = tempURL {
                    // Save the file to the Documents directory
                    if let permanentURL = self.saveAudioFilePermanently(tempURL: tempURL, fileName: fileName) {
                        let newItem = GeneratedSpeechItem(audioURL: permanentURL, text: currentText, voiceName: voice.name, createdAt: Date(), fileName: fileName)
                        self.generatedItems.insert(newItem, at: 0)
                        if self.generatedItems.count > 5 {
                            self.generatedItems = Array(self.generatedItems.prefix(5))
                        }
                    } else {
                        self.errorMessage = "Failed to save generated speech. Please try again."
                    }
                } else {
                    self.errorMessage = "Failed to generate speech. Please try again."
                }
            }
        }
    }
    
    private func saveAudioFilePermanently(tempURL: URL, fileName: String) -> URL? {
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let permanentURL = documentsDirectory.appendingPathComponent(fileName)
        
        do {
            if FileManager.default.fileExists(atPath: permanentURL.path) {
                try FileManager.default.removeItem(at: permanentURL)
            }
            try FileManager.default.copyItem(at: tempURL, to: permanentURL)
            return permanentURL
        } catch {
            print("Error saving audio file permanently: \(error)")
            return nil
        }
    }
    
    private func openElevenLabsWebsite() {
        if let url = URL(string: "https://elevenlabs.io") {
            NSWorkspace.shared.open(url)
        }
    }
}

struct AudioPlayerView: View {
    let item: GeneratedSpeechItem
    @StateObject private var viewModel = AudioPlayerViewModel()
    @State private var isRowHovering = false
    @State private var isButtonHovering = false
    
    var body: some View {
        ZStack {
            HStack(spacing: 12) {
                Button(action: { viewModel.togglePlayPause(for: item.audioURL) }) {
                    Image(systemName: viewModel.isPlaying ? "pause.fill" : "play.fill")
                        .frame(width: 24, height: 24)
                        .foregroundColor(.black)
                }
                .buttonStyle(PlainButtonStyle())
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.text)
                        .lineLimit(1)
                        .font(.system(size: 13, weight: .medium))
                    Text("Time created: \(formattedTime(item.createdAt)) | \(item.voiceName)")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                }
                
                Spacer()
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.1))
                    .opacity(isRowHovering ? 1 : 0)
            )
            .onHover { hovering in
                withAnimation(.easeInOut(duration: 0.2)) {
                    isRowHovering = hovering
                }
            }
            .contentShape(Rectangle())
            .onTapGesture {
                viewModel.togglePlayPause(for: item.audioURL)
            }
            
            HStack {
                Spacer()
                Button(action: { downloadAudio(url: item.audioURL, fileName: item.fileName) }) {
                    HStack(alignment: .center, spacing: 4) {
                        Image("downloadbutton")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 16, height: 16)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .frame(height: 40, alignment: .center)
                    .background(.white)
                    .cornerRadius(8)
                    .shadow(color: Color(red: 0.06, green: 0.09, blue: 0.16).opacity(0.05), radius: 1, x: 0, y: 1)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .inset(by: 0.5)
                            .stroke(Color(red: 0.9, green: 0.91, blue: 0.92), lineWidth: 1)
                    )
                }
                .buttonStyle(PlainButtonStyle())
                .onHover { hovering in
                    isButtonHovering = hovering
                }
            }
            .padding(.trailing, 12)
        }
        .frame(height: 60)
        .onDrag {
            let provider = NSItemProvider(object: item.audioURL as NSURL)
            provider.suggestedName = item.fileName
            return provider
        } preview: {
            DragPreview(text: item.text)
        }
        .onDisappear {
            viewModel.stop()
        }
    }
    
    private func downloadAudio(url: URL, fileName: String) {
        let savePanel = NSSavePanel()
        savePanel.allowedContentTypes = [UTType.mp3]
        savePanel.nameFieldStringValue = fileName
        
        if let screen = NSScreen.main {
            let screenFrame = screen.visibleFrame
            let panelSize = NSSize(width: 540, height: 360) // Adjust these values as needed
            
            // Calculate the position to center the panel
            let xPos = screenFrame.midX - (panelSize.width / 2)
            let yPos = screenFrame.midY - (panelSize.height / 2)
            
            savePanel.setFrameOrigin(NSPoint(x: xPos, y: yPos))
            savePanel.setContentSize(panelSize)
            
            let response = savePanel.runModal()
            
            if response == .OK, let saveURL = savePanel.url {
                do {
                    try FileManager.default.copyItem(at: url, to: saveURL)
                } catch {
                    print("Error saving file: \(error.localizedDescription)")
                    let alert = NSAlert()
                    alert.messageText = "Error Saving File"
                    alert.informativeText = error.localizedDescription
                    alert.alertStyle = .warning
                    alert.addButton(withTitle: "OK")
                    alert.runModal()
                }
            }
        } else {
            // Fallback if we can't get the main screen
            let response = savePanel.runModal()
            
            if response == .OK, let saveURL = savePanel.url {
                do {
                    try FileManager.default.copyItem(at: url, to: saveURL)
                } catch {
                    print("Error saving file: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func formattedTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
}

struct CustomPicker<T: Hashable, Content: View>: View {
    @EnvironmentObject var appDelegate: AppDelegate
    @Binding var selection: T?
    let options: [T]
    let placeholder: String
    let iconType: IconType
    let content: (T) -> Content
    
    enum IconType {
        case voiceIcon
        case modelIcon
    }
    
    var body: some View {
        Menu {
            ForEach(options, id: \.self) { option in
                Button(action: {
                    selection = option
                    DispatchQueue.main.async {
                        appDelegate.isMenuOpen = false
                    }
                }) {
                    content(option)
                        .lineLimit(1)
                        .truncationMode(.tail)
                }
            }
        } label: {
            HStack {
                if let selection = selection {
                    content(selection)
                        .lineLimit(1)
                        .truncationMode(.tail)
                } else {
                    Text(placeholder)
                }
                Spacer()
                iconView
            }
            .frame(maxWidth: 150)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.gray.opacity(0.5), lineWidth: 1)
            )
        }
        .menuStyle(BorderlessButtonMenuStyle())
        .frame(maxWidth: .infinity)
        .onHover { isHovering in
            if isHovering {
                appDelegate.isMenuOpen = true
            }
        }
    }
    
    @ViewBuilder
    private var iconView: some View {
        switch iconType {
        case .voiceIcon:
            Circle()
                .fill(AngularGradient(gradient: Gradient(colors: [.blue, .purple, .red, .orange]), center: .center))
                .frame(width: 24, height: 24)
        case .modelIcon:
            Image(systemName: "cpu")
                .foregroundColor(.gray)
                .frame(width: 24, height: 24)
        }
    }
}

struct ViewHeightKey: PreferenceKey {
    static var defaultValue: CGFloat { 0 }
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct DragPreview: View {
    let text: String
    
    var body: some View {
        VStack {
            Image(systemName: "waveform")
                .font(.largeTitle)
            Text(text)
                .font(.caption)
                .lineLimit(1)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
        .shadow(radius: 3)
    }
}
