import SwiftUI
import ElevenLabsSDK
import _Concurrency

struct OrbView: View {
    let mode: ElevenLabsSDK.Mode
    let audioLevel: Float
    
    private var iconName: String {
        switch mode {
        case .listening:
            return "waveform"
        case .speaking:
            return "speaker.wave.2.fill"
        }
    }
    
    private var scale: CGFloat {
        0.9 + CGFloat(audioLevel * 3)
    }
    
    var body: some View {
        ZStack {
            // Orb image
            Image("orb")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 150)
            
            // White circle background with blur effect
            Circle()
                .fill(.white)
                .frame(width: 48, height: 48)
                .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
                .blur(radius: 0.5)
                .scaleEffect(scale)
                .animation(.spring(response: 0.1, dampingFraction: 0.8), value: scale)
            
            // Mode icon
            Image(systemName: iconName)
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(.black)
                .scaleEffect(scale)
                .animation(.spring(response: 0.1, dampingFraction: 0.8), value: scale)
        }
    }
}

struct ConversationalAIExampleView: View {
    @State private var currentAgentIndex = 0
    @State private var conversation: ElevenLabsSDK.Conversation?
    @State private var audioLevel: Float = 0.0
    @State private var mode: ElevenLabsSDK.Mode = .listening
    @State private var status: ElevenLabsSDK.Status = .disconnected
    
    let agents = [
        Agent(
            id: "<insert-agent-url-here>",
            name: "Matilda",
            description: "Math tutor"
        ),
        Agent(
            id: "<insert-agent-url-here>",
            name: "Eric",
            description: "Support agent"
        ),
        Agent(
            id: "<insert-agent-url-here>",
            name: "Callum",
            description: "Video game character"
        )
    ]

    private func beginConversation(agent: Agent) {
        if status == .connected {
            conversation?.endSession()
            conversation = nil
        } else {
            Task {
                do {
                    // If you would like to override an agent, uncoming the following lines:
                    /*
                     let promptOverride = ElevenLabsSDK.AgentPrompt(prompt: "You are a pleasant assistant called Eric, supporting a customer called Louis.")
                     let agentConfig = ElevenLabsSDK.AgentConfig(
                         prompt: promptOverride,
                         firstMessage: "Hi, Louis! I'm Eric, your friendly assistant.",
                         language: .en
                     )
                     let overrides = ElevenLabsSDK.ConversationConfigOverride(
                         agent: agentConfig
                     )
                     let config = ElevenLabsSDK.SessionConfig(agentId: agent.id, overrides: overrides)
                     */
              
                    let config = ElevenLabsSDK.SessionConfig(agentId: agent.id)
                    var callbacks = ElevenLabsSDK.Callbacks()
                    
                    callbacks.onConnect = { conversationId in
                        
                        status = .connected
                    }
                    callbacks.onDisconnect = {
                        
                        status = .disconnected
                    }
                    callbacks.onMessage = { message, role in
                        DispatchQueue.main.async {
                            print(message)
                        }
                    }
                    
                    callbacks.onError = { errorMessage, _ in
                        print("Error: \(errorMessage)")
                    }
                    
                    // Move these callbacks out from inside onStatusChange
                    callbacks.onStatusChange = { newStatus in
                        DispatchQueue.main.async {
                            status = newStatus
                        }
                    }
                    
                    callbacks.onModeChange = { newMode in
                        DispatchQueue.main.async {
                            mode = newMode
                        }
                    }
                    
                    callbacks.onVolumeUpdate = { newVolume in
                        DispatchQueue.main.async {
                            audioLevel = newVolume
                        }
                    }
                    
                    conversation = try await ElevenLabsSDK.Conversation.startSession(config: config, callbacks: callbacks)
                } catch {
                    print("Error starting conversation: \(error)")
                }
            }
        }
    }
    
    
    
    var body: some View {
        ZStack {
            GeometryReader { geometry in
                VStack {
                    Spacer()
                    
                    OrbView(mode: mode, audioLevel: audioLevel)
                        .padding(.bottom, 20)
                    
                    Text(agents[currentAgentIndex].name)
                        .font(.title2)
                        .foregroundColor(.black)
                    
                    Text(agents[currentAgentIndex].description)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    
                    HStack(spacing: 8) {
                        ForEach(0..<agents.count, id: \ .self) { index in
                            Circle()
                                .fill(index == currentAgentIndex ? Color.black : Color.gray)
                                .frame(width: 8, height: 8)
                        }
                    }
                    .padding()
                    
                    Spacer()
                    
                    CallButton(
                        connectionStatus: status,
                        action: { beginConversation(agent: agents[currentAgentIndex]) }
                    )
                }
                .frame(width: geometry.size.width, height: geometry.size.height)
            }
            
            VStack {
                Image("logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(height: 40)
                    .padding(.top, 16)
                
                Spacer()
            }
        }
        .gesture(
            DragGesture()
                .onEnded { value in
                    guard status != .connected else { return }
                    
                    if value.translation.width < 0 && currentAgentIndex < agents.count - 1 {
                        currentAgentIndex += 1
                    } else if value.translation.width > 0 && currentAgentIndex > 0 {
                        currentAgentIndex -= 1
                    }
                }
        )
    }
}

// MARK: - Call Button Component
struct CallButton: View {
    let connectionStatus: ElevenLabsSDK.Status
    let action: () -> Void
    
    private var buttonIcon: String {
        switch connectionStatus {
        case .connected:
            return "phone.down.fill"
        case .connecting:
            return "phone.arrow.up.right.fill"
        case .disconnecting:
            return "phone.arrow.down.left.fill"
        default:
            return "phone.fill"
        }
    }
    
    private var buttonColor: Color {
        switch connectionStatus {
        case .connected:
            return .red
        case .connecting, .disconnecting:
            return .gray
        default:
            return .black
        }
    }
    
    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(buttonColor)
                    .frame(width: 64, height: 64)
                    .shadow(radius: 5)
                
                Image(systemName: buttonIcon)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(.white)
            }
        }
        .padding(.bottom, 40)
    }
}

// MARK: - Types and Preview
struct Agent {
    let id: String
    let name: String
    let description: String
}

struct ConvAIExampleView_Previews: PreviewProvider {
    static var previews: some View {
        ConversationalAIExampleView()
    }
}
