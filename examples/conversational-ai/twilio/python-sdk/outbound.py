import os
import json
import traceback
from dotenv import load_dotenv
from typing import Optional
from fastapi import APIRouter, Request, WebSocket, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
from twilio.rest import Client
from elevenlabs import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation, ConversationConfig
from starlette.websockets import WebSocketDisconnect
from twilio_audio_interface import TwilioAudioInterface
import urllib.parse

router = APIRouter()

# Get environment variables
# Update the load_dotenv call with error handling and specific file path
if not load_dotenv(dotenv_path=".env", override=True):
    print("Warning: .env file not found. Make sure it exists with required environment variables.")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Validate required environment variables
if not all([ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, TWILIO_ACCOUNT_SID, 
            TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
    raise ValueError("Missing required environment variables")

# Initialize Twilio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

class OutboundCallRequest(BaseModel):
    number: str
    prompt: Optional[str] = "you are a gary from the phone store"
    first_message: Optional[str] = "hey there! how can I help you today?"

@router.post("/outbound-call")
async def initiate_outbound_call(request: OutboundCallRequest, req: Request):
    """Initiate an outbound call using Twilio"""
    try:
        call = twilio_client.calls.create(
            from_=TWILIO_PHONE_NUMBER,
            to=request.number,
            url=f"https://{req.base_url.hostname}/outbound-call-twiml"
                f"?prompt={urllib.parse.quote(request.prompt)}&first_message={urllib.parse.quote(request.first_message)}"
        )
        return {
            "success": True,
            "message": "Call initiated",
            "callSid": call.sid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/outbound-call-twiml")
@router.post("/outbound-call-twiml")
async def handle_outbound_call_twiml(request: Request):
    """Generate TwiML for outbound calls"""
    prompt = request.query_params.get("prompt", "")
    first_message = request.query_params.get("first_message", "")
    
    response = VoiceResponse()
    connect = Connect()
    stream = Stream(
        url=f"wss://{request.base_url.hostname}/outbound-media-stream"
    )
    stream.parameter(
        name="prompt",
        value=prompt
    ).parameter(
        name="first_message",
        value=first_message
    )
    connect.append(stream)
    response.append(connect)
    return HTMLResponse(content=str(response), media_type="application/xml")

@router.websocket("/outbound-media-stream")
async def handle_outbound_media_stream(websocket: WebSocket):
    """Handle WebSocket connection for outbound call media streaming"""
    await websocket.accept()
    print("[Server] Outbound WebSocket connection opened")

    audio_interface = TwilioAudioInterface(websocket)
    eleven_labs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    conversation = None

    try:
        # Get parameters from the start message
        start_message = await websocket.receive_text()
        print("[Server] Received start message:", start_message)
        start_data = json.loads(start_message)
        custom_params = start_data.get("start", {}).get("customParameters", {})
        
        prompt = custom_params.get("prompt", "you are a gary from the phone store")
        first_message = custom_params.get("first_message", "hey there! how can I help you today?")

        print("[Server] Starting outbound conversation with prompt:", prompt)
        print("[Server] First message:", first_message)

        conversation = Conversation(
            client=eleven_labs_client,
            agent_id=ELEVENLABS_AGENT_ID,
            requires_auth=True,
            audio_interface=audio_interface,
            callback_agent_response=lambda text: print(f"[Agent] {text}"),
            callback_user_transcript=lambda text: print(f"[User] {text}"),
            config=ConversationConfig(
                conversation_config_override={
                    "agent": {
                        "prompt": {
                            "prompt": prompt
                        },
                        "first_message": first_message
                    }
                }
            )
        )

        conversation.start_session()
        print("[Server] Outbound conversation started")

        async for message in websocket.iter_text():
            if not message:
                continue
            await audio_interface.handle_twilio_message(json.loads(message))

    except WebSocketDisconnect:
        print("[Server] Outbound WebSocket disconnected")
    except Exception:
        print("[Server] Error occurred in outbound WebSocket handler:")
        traceback.print_exc()
    finally:
        if conversation:
            try:
                conversation.end_session()
                conversation.wait_for_session_end()
                print("[Server] Outbound conversation ended")
            except Exception:
                print("[Server] Error ending outbound conversation session:")
                traceback.print_exc() 