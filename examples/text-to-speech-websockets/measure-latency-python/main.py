import asyncio
import websockets
import json
import base64
import os
import subprocess
import time


# Define API keys and voice ID
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
VOICE_ID = 'nPczCjzI2devNBz1zQrb' #Brian



async def text_chunker(chunks):
    """Split text into chunks, ensuring to not break words."""
    splitters = (".", ",", "?", "!", ";", ":", "—", "-", "(", ")", "[", "]", "}", " ")
    buffer = ""

    async for text in chunks:
        if buffer.endswith(splitters):
            yield buffer + " "
            buffer = text
        elif text.startswith(splitters):
            yield buffer + text[0] + " "
            buffer = text[1:]
        else:
            buffer += text

    if buffer:
        yield buffer + " "

async def stream(audio_stream):
    """Stream audio data using mpv player."""
    mpv_process = subprocess.Popen(
        ["mpv", "--no-cache", "--no-terminal", "--", "fd://0"],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    print("Started streaming audio")
    async for chunk in audio_stream:
        if chunk:
            mpv_process.stdin.write(chunk)
            mpv_process.stdin.flush()

    if mpv_process.stdin:
        mpv_process.stdin.close()
    mpv_process.wait()


async def text_to_speech_input_streaming(voice_id, text_iterator):
    """Send text to ElevenLabs API and stream the returned audio."""
    uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id=eleven_turbo_v2"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "text": " ",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "use_speaker_boost": False},
            "generation_config": {
                "chunk_length_schedule": [120, 160, 250, 290]
            },
            "xi_api_key": ELEVENLABS_API_KEY,
        }))
        async def listen():
            """Listen to the websocket for audio data and stream it."""
            first_byte = True
            while True:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    if data.get("audio"):
                        if first_byte:
                            first_byte = False
                            print(f"first byte received at: {time.time()}")
                        yield base64.b64decode(data["audio"])
                    elif data.get('isFinal'):
                        break
                except websockets.exceptions.ConnectionClosed:
                    print("Connection closed")
                    break

        listen_task = asyncio.create_task(stream(listen()))

        print(f"first byte sent at: {time.time()}")
        async for text in text_chunker(text_iterator):
            await websocket.send(json.dumps({"text": text}))
        await websocket.send(json.dumps({"text": "", "flush": True}))

        await listen_task


async def chat_completion(query):
    """Retrieve text from OpenAI and pass it to the text-to-speech function."""
    # response = await aclient.chat.completions.create(model='gpt-4-1106-preview', messages=[{'role': 'user', 'content': query}],

    response = "The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. Silently, the meandering brook continued its ceaseless journey, whispering secrets only the trees seemed privy to. In the distance, a solitary figure emerged, adorned in an elegant charcoal suit, the epitome of refined grace. His countenance, etched with a hint of melancholy, betrayed a life lived among whispers of aristocracy and love lost. As he approached the grand manor, its ivy-covered walls whispered tales of generations past, where opulent soirées once transpired and secrets of seemingly immortal enigmas were carefully guarded. Intricate wrought iron gates creaked open, a testament to a weighty history. Beyond the manicured gardens, towering oak trees stood in resolute vigilance, their gnarled branches a testament to the passage of time. Inside, the grand foyer beckoned with an air of faded grandeur. Sunlight filtered through the stained glass windows, casting an ethereal kaleidoscope of colors on the marble floors, once trod upon by a society that possessed an insatiable hunger for life's indulgences. There, in an opulent wing chair, sat an elderly gentleman"
    response = response.split(" ")
    async def text_iterator():
        words = 0
        to_send = ""
        for chunk in response:
            to_send += chunk  + ' '
            words += 1
            if words >= 10:
                yield to_send
                words = 0
                to_send = ""

    await text_to_speech_input_streaming(VOICE_ID, text_iterator())


# Main execution
if __name__ == "__main__":
    user_query = "Hello, tell me a very long story."
    asyncio.run(chat_completion(user_query))