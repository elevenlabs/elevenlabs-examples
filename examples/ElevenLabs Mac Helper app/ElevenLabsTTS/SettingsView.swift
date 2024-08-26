import SwiftUI

struct SettingsView: View {
    @Binding var apiKey: String
    @Binding var isPresented: Bool
    @Binding var isFirstLaunch: Bool
    @State private var tempAPIKey: String = ""
    @State private var showAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        VStack(spacing: 20) {
            Text(isFirstLaunch ? "Welcome to ElevenLabs" : "Settings")
                .font(.headline)
            
            Text("Please enter your API key to get started, you can grab this from the Profile+API key section on the ElevenLabs.io website")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal)
            
            TextField("Enter API Key", text: $tempAPIKey)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)
            
            HStack {
                if !isFirstLaunch {
                    Button("Cancel") {
                        isPresented = false
                    }
                    .keyboardShortcut(.cancelAction)
                }
                
                Button("Save") {
                    saveAPIKey()
                }
                .keyboardShortcut(.defaultAction)
                .disabled(tempAPIKey.isEmpty)
            }
            
            Link("Get API Key", destination: URL(string: "https://elevenlabs.io/docs/api-reference/text-to-speech#authentication")!)
                .font(.footnote)
        }
        .padding()
        .frame(width: 300, height: 300)
        .onAppear {
            tempAPIKey = apiKey
        }
        .alert(isPresented: $showAlert) {
            Alert(title: Text("API Key"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func saveAPIKey() {
        apiKey = tempAPIKey
        UserDefaults.standard.set(tempAPIKey, forKey: "ElevenLabsAPIKey")
        ElevenLabsAPI.shared.updateAPIKey(tempAPIKey)
        
        alertMessage = "API Key saved successfully!"
        showAlert = true
        
        isFirstLaunch = false
        
        // Close the settings view after a short delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isPresented = false
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView(apiKey: .constant(""), isPresented: .constant(true), isFirstLaunch: .constant(true))
    }
}
