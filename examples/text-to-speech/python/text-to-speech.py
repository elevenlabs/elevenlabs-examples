from elevenlabs.client import ElevenLabs
from elevenlabs import play

API_KEY: str = "YOUR_API_KEY"
VOICE_ID: str = "YOUR_VOICE_ID"

client = ElevenLabs(
  api_key=API_KEY 
)

text_to_speak: str = 'My name is <phoneme alphabet="ipa" ph="/ʃɪˈvɔːn/">Siobhan</phoneme>, and my friend\'s name is <phoneme alphabet="ipa" ph="/ˈiːfə/">Aoife</phoneme>.'

audio = client.generate(
    text=text_to_speak,
    voice=VOICE_ID
)

play(audio)