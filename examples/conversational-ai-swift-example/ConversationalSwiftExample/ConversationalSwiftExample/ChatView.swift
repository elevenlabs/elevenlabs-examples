import SwiftUI
import ElevenLabsSwift

struct ChatView: View {
    // MARK: - State Properties
    @State private var conversation: ElevenLabsSwift.Conversation?
    @State private var messages: [Message] = []
    @State private var currentMode: ElevenLabsSwift.Mode = .listening
    @State private var connectionStatus: ElevenLabsSwift.Status = .disconnected
    @State private var volume: Float = 1.0
    
    // MARK: - Body
    var body: some View {
        ZStack {
            Color(UIColor.systemBackground)
                .edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 0) {
                HeaderView()
                StatusBarView(status: connectionStatus, mode: currentMode)
                MessagesView(messages: messages)
                ControlsView(
                    isConnected: connectionStatus == .connected,
                    onStart: startConversation,
                    onEnd: endConversation
                )
            }
        }
        .preferredColorScheme(.dark)
    }
    
    // MARK: - Header View
    private struct HeaderView: View {
        var body: some View {
            VStack {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .padding(.horizontal, 100)
                    .padding(.top, 20)
                
                Text("ElevenLabsSwift Demo")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
            }
            .padding(.bottom, 10)
            .background(Color(UIColor.white))
        }
    }
    
    // MARK: - Status Bar View
    private struct StatusBarView: View {
        let status: ElevenLabsSwift.Status
        let mode: ElevenLabsSwift.Mode
        
        var body: some View {
            HStack {
                StatusIndicator(status: status)
                Spacer()
                Text(mode.rawValue.capitalized)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color(UIColor.tertiarySystemBackground))
        }
    }
    
    // MARK: - Messages View
    private struct MessagesView: View {
        let messages: [Message]
        
        var body: some View {
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                }
                .padding()
            }
        }
    }
    
    // MARK: - Controls View
    private struct ControlsView: View {
        let isConnected: Bool
        let onStart: () -> Void
        let onEnd: () -> Void
        
        var body: some View {
            VStack(spacing: 16) {
                HStack(spacing: 20) {
                    Button(action: onStart) {
                        Label("Start", systemImage: "play.fill")
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(isConnected)
                    
                    Button(action: onEnd) {
                        Label("End", systemImage: "stop.fill")
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(!isConnected)
                }
            }
            .padding()
            .background(Color(UIColor.white))
            .cornerRadius(10)
        }
    }
    
    // MARK: - Functions
    private func startConversation() {
        let config = ElevenLabsSwift.SessionConfig(agentId: "<REPLACE-WITH-YOUR-AGENT-ID")
        conversation?.startRecording()
        
        Task {
            do {
                var callbacks = ElevenLabsSwift.Callbacks()
                callbacks.onConnect = { conversationId in
                    print("Connected with conversation ID: \(conversationId)")
                }
                callbacks.onDisconnect = {
                    print("Disconnected")
                }
                callbacks.onMessage = { message, role in
                    DispatchQueue.main.async {
                        self.messages.append(Message(text: message, role: role))
                    }
                }
                callbacks.onError = { errorMessage, _ in
                    print("Error: \(errorMessage)")
                }
                callbacks.onStatusChange = { newStatus in
                    DispatchQueue.main.async {
                        self.connectionStatus = newStatus
                    }
                }
                callbacks.onModeChange = { newMode in
                    DispatchQueue.main.async {
                        self.currentMode = newMode
                    }
                }
                
                conversation = try await ElevenLabsSwift.Conversation.startSession(config: config, callbacks: callbacks)
            } catch {
                print("Failed to start conversation: \(error.localizedDescription)")
            }
        }
    }
    
    private func endConversation() {
        conversation?.endSession()
        conversation = nil
        messages.removeAll()
    }
}

// MARK: - Subviews

struct StatusIndicator: View {
    let status: ElevenLabsSwift.Status
    
    var body: some View {
        HStack {
            Circle()
                .fill(statusColor)
                .frame(width: 10, height: 10)
            Text(status.rawValue.capitalized)
                .font(.subheadline)
                .foregroundColor(.primary)
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .connected:
            return .green
        case .connecting, .disconnecting:
            return .yellow
        case .disconnected:
            return .red
        }
    }
}

struct MessageBubble: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.role == .user {
                Spacer()
            }
            Text(message.text)
                .padding(12)
                .background(message.role == .user ? Color.blue : Color(UIColor.tertiarySystemBackground))
                .foregroundColor(message.role == .user ? .white : .primary)
                .cornerRadius(16)
            if message.role != .user {
                Spacer()
            }
        }
    }
}

// MARK: - Button Styles

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(Color.black)
            .foregroundColor(.white)
            .cornerRadius(10)
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

// MARK: - Models

struct Message: Identifiable {
    let id = UUID()
    let text: String
    let role: ElevenLabsSwift.Role
}

// MARK: - Preview

struct ChatView_Previews: PreviewProvider {
    static var previews: some View {
        ChatView()
    }
}
