import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Voice {
  voice_id: string;
  name: string;
}

const SUPABASE_PROJECT_REF = null;
const FUNCTION_BASE_URL = SUPABASE_PROJECT_REF
  ? `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1`
  : "http://localhost:54321/functions/v1";

const fetchVoices = async () => {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices");
    if (!response.ok) throw new Error("Failed to fetch voices");
    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error("Error fetching voices:", error);
    // Return some default voices as fallback
    return [
      { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
      { voice_id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
      { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "Bella" },
      { voice_id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli" },
    ];
  }
};

const Index = () => {
  const [text, setText] = useState("");
  const [audioSource, setAudioSource] = useState<string | null>(null);

  const {
    data: voices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["voices"],
    queryFn: fetchVoices,
  });

  const [selectedVoice, setSelectedVoice] = useState("");

  // Set initial selected voice once voices are loaded
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0].voice_id);
    }
  }, [voices, selectedVoice]);

  const handleGenerate = () => {
    if (text.length === 0) {
      alert("Please enter some text to generate speech");
      return;
    }
    setAudioSource(
      `${FUNCTION_BASE_URL}/text-to-speech?text=${text}&voiceId=${selectedVoice}`
    );
    console.log("Generating speech with:", { text, selectedVoice });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8 animate-fadeIn">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Stream Text To Speech on the Edge
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Generate Text To Speech (TTS) with ElevenLabs in Supabase Edge
            Function and cache the audio in Supabase Storage
          </p>
        </div>

        <div className="space-y-6">
          <div className="textarea-container">
            <textarea
              maxLength={2000}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full h-48 p-4 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-darkGreen-light text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <option>Loading voices...</option>
              ) : error ? (
                <option>Error loading voices</option>
              ) : (
                voices.map((voice: Voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedVoice}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:hover:bg-green-600"
            >
              Generate Speech
            </button>
          </div>

          {audioSource && (
            <div className="mt-6">
              <audio
                autoPlay={!!audioSource}
                controls
                className="w-full"
                src={audioSource}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
