import Foundation

class ElevenLabsAPI {
    static let shared = ElevenLabsAPI()
    private var apiKey: String = UserDefaults.standard.string(forKey: "ElevenLabsAPIKey") ?? ""
    
    private init() {}
    
    func updateAPIKey(_ newKey: String) {
        apiKey = newKey
    }
    
    func fetchVoices(completion: @escaping ([Voice]) -> Void) {
        guard let url = URL(string: "https://api.elevenlabs.io/v1/voices") else {
            completion([])
            return
        }
        
        var request = URLRequest(url: url)
        request.addValue(apiKey, forHTTPHeaderField: "xi-api-key")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else {
                print("Error fetching voices: \(error?.localizedDescription ?? "Unknown error")")
                DispatchQueue.main.async {
                    completion([])
                }
                return
            }
            
            do {
                let voicesResponse = try JSONDecoder().decode(VoicesResponse.self, from: data)
                DispatchQueue.main.async {
                    completion(voicesResponse.voices)
                }
            } catch {
                print("Error decoding voices: \(error.localizedDescription)")
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("Received JSON: \(jsonString)")
                }
                DispatchQueue.main.async {
                    completion([])
                }
            }
        }.resume()
    }
    
    func generateSpeech(text: String, voiceID: String, modelID: String, completion: @escaping (URL?) -> Void) {
        guard let url = URL(string: "https://api.elevenlabs.io/v1/text-to-speech/\(voiceID)") else {
            completion(nil)
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("audio/mpeg", forHTTPHeaderField: "Accept")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(apiKey, forHTTPHeaderField: "xi-api-key")
        
        let body: [String: Any] = [
            "text": text,
            "model_id": modelID,
            "voice_settings": [
                "stability": 0.5,
                "similarity_boost": 0.5
            ]
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else {
                print("Error generating speech: \(error?.localizedDescription ?? "Unknown error")")
                DispatchQueue.main.async {
                    completion(nil)
                }
                return
            }
            
            let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("generated_speech.mp3")
            do {
                try data.write(to: tempURL)
                DispatchQueue.main.async {
                    completion(tempURL)
                }
            } catch {
                print("Error saving audio file: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion(nil)
                }
            }
        }.resume()
    }
    
    func fetchModels(completion: @escaping ([Model]) -> Void) {
        guard let url = URL(string: "https://api.elevenlabs.io/v1/models") else {
            completion([])
            return
        }
        
        var request = URLRequest(url: url)
        request.addValue(apiKey, forHTTPHeaderField: "xi-api-key")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let data = data {
                    do {
                        let models = try JSONDecoder().decode([Model].self, from: data)
                        completion(models)
                    } catch {
                        print("Error decoding models: \(error)")
                        completion([])
                    }
                } else {
                    print("Error fetching models: \(error?.localizedDescription ?? "Unknown error")")
                    completion([])
                }
            }
        }.resume()
    }
}

struct VoicesResponse: Codable {
    let voices: [Voice]
}

struct Voice: Codable, Identifiable, Hashable {
    let voice_id: String
    let name: String
    let preview_url: String?
    let category: String?
    let labels: [String: String]?
    
    var id: String { voice_id }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(voice_id)
    }
    
    static func == (lhs: Voice, rhs: Voice) -> Bool {
        return lhs.voice_id == rhs.voice_id
    }
}
