import json
import traceback
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from twilio.twiml.voice_response import VoiceResponse, Connect
from elevenlabs import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from twilio_audio_interface import TwilioAudioInterface

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize ElevenLabs client
eleven_labs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
ELEVEN_LABS_AGENT_ID = os.getenv("AGENT_ID")

@app.get("/")
async def root():
    return {"message": "Twilio-ElevenLabs Integration Server"}

@app.api_route("/incoming-call-eleven", methods=["GET", "POST"])
async def handle_incoming_call(request: Request):
    """Handle incoming call and return TwiML response to connect to Media Stream."""
    response = VoiceResponse()
    host = request.url.hostname
    connect = Connect()
    connect.stream(
        url=f"wss://{host}/media-stream-eleven",
    )

    response.append(connect)
    return HTMLResponse(content=str(response), media_type="application/xml")


@app.websocket("/media-stream-eleven")
async def handle_media_stream(websocket: WebSocket):
    """Handle WebSocket connections for Eleven Labs integration"""
    await websocket.accept()
    print("WebSocket connection established")

    audio_interface = TwilioAudioInterface(websocket)
    conversation = None

    try:
        # Create a new conversation instance for each connection
        conversation = Conversation(
            client=eleven_labs_client,
            agent_id=ELEVEN_LABS_AGENT_ID,
            requires_auth=False,
            audio_interface=audio_interface,
            callback_agent_response=lambda text: print(f"Agent said: {text}"),
            callback_user_transcript=lambda text: print(f"User said: {text}"),
        )

        conversation.start_session()
        print("Conversation session started")

        async for message in websocket.iter_text():
            if not message:
                continue

            try:
                data = json.loads(message)
                await audio_interface.handle_twilio_message(data)
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                traceback.print_exc()

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error in WebSocket handler: {str(e)}")
        traceback.print_exc()
    finally:
        try:
            if conversation:
                print("Ending conversation session...")
                conversation.end_session()
                conversation.wait_for_session_end()
            audio_interface.stop()
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")
            traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
