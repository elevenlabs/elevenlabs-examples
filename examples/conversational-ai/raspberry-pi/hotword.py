import os
import signal
import time
from eff_word_net.streams import SimpleMicStream
from eff_word_net.engine import HotwordDetector

from eff_word_net.audio_processing import Resnet50_Arc_loss

# from eff_word_net import samples_loc

from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation, ConversationInitiationData
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface

convai_active = False

elevenlabs = ElevenLabs()
agent_id = os.getenv("ELEVENLABS_AGENT_ID")
api_key = os.getenv("ELEVENLABS_API_KEY")

dynamic_vars = {
    'user_name': 'Thor',
    'greeting': 'Hey'
}

config = ConversationInitiationData(
    dynamic_variables=dynamic_vars
)

base_model = Resnet50_Arc_loss()

eleven_hw = HotwordDetector(
    hotword="hey_eleven",
    model = base_model,
    reference_file=os.path.join("hotword_refs", "hey_eleven_ref.json"),
    threshold=0.7,
    relaxation_time=2
)

def create_conversation():
    """Create a new conversation instance"""
    return Conversation(
        # API client and agent ID.
        elevenlabs,
        agent_id,
        config=config,

        # Assume auth is required when API_KEY is set.
        requires_auth=bool(api_key),

        # Use the default audio interface.
        audio_interface=DefaultAudioInterface(),

        # Simple callbacks that print the conversation to the console.
        callback_agent_response=lambda response: print(f"Agent: {response}"),
        callback_agent_response_correction=lambda original, corrected: print(f"Agent: {original} -> {corrected}"),
        callback_user_transcript=lambda transcript: print(f"User: {transcript}"),
        
        # Uncomment if you want to see latency measurements.
        # callback_latency_measurement=lambda latency: print(f"Latency: {latency}ms"),
    )

def start_mic_stream():
    """Start or restart the microphone stream"""
    global mic_stream
    try:
        # Always create a new stream instance
        mic_stream = SimpleMicStream(
            window_length_secs=1.5,
            sliding_window_secs=0.75,
        )
        mic_stream.start_stream()
        print("Microphone stream started")
    except Exception as e:
        print(f"Error starting microphone stream: {e}")
        mic_stream = None
        time.sleep(1)  # Wait a bit before retrying

def stop_mic_stream():
    """Stop the microphone stream safely"""
    global mic_stream
    try:
        if mic_stream:
            # SimpleMicStream doesn't have a stop_stream method
            # We'll just set it to None and recreate it next time
            mic_stream = None
            print("Microphone stream stopped")
    except Exception as e:
        print(f"Error stopping microphone stream: {e}")

# Initialize microphone stream
mic_stream = None
start_mic_stream()

print("Say Hey Eleven ")
while True:
    if not convai_active:
        try:
            # Make sure we have a valid mic stream
            if mic_stream is None:
                start_mic_stream()
                continue
                
            frame = mic_stream.getFrame()
            result = eleven_hw.scoreFrame(frame)
            if result == None:
                #no voice activity
                continue
            if result["match"]:
                print("Wakeword uttered", result["confidence"])
                
                # Stop the microphone stream to avoid conflicts
                stop_mic_stream()
                
                # Start ConvAI Session
                print("Start ConvAI Session")
                convai_active = True
                
                try:
                    # Create a new conversation instance
                    conversation = create_conversation()
                    
                    # Start the session
                    conversation.start_session()
                    
                    # Set up signal handler for graceful shutdown
                    def signal_handler(sig, frame):
                        print("Received interrupt signal, ending session...")
                        try:
                            conversation.end_session()
                        except Exception as e:
                            print(f"Error ending session: {e}")
                    
                    signal.signal(signal.SIGINT, signal_handler)
                    
                    # Wait for session to end
                    conversation_id = conversation.wait_for_session_end()
                    print(f"Conversation ID: {conversation_id}")
                    
                except Exception as e:
                    print(f"Error during conversation: {e}")
                finally:
                    # Cleanup
                    convai_active = False
                    print("Conversation ended, cleaning up...")
                    
                    # Give some time for cleanup
                    time.sleep(1)
                    
                    # Restart microphone stream
                    start_mic_stream()
                    print("Ready for next wake word...")
                    
        except Exception as e:
            print(f"Error in wake word detection: {e}")
            # Try to restart microphone stream if there's an error
            mic_stream = None
            time.sleep(1)
            start_mic_stream()