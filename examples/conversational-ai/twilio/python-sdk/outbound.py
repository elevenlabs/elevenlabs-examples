import os
import json
import traceback
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
from twilio.rest import Client
from elevenlabs import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from twilio_audio_interface import TwilioAudioInterface
from starlette.websockets import WebSocketDisconnect, WebSocketState
from urllib.parse import quote

load_dotenv()

# Load environment variables
ELEVEN_LABS_AGENT_ID = os.getenv("ELEVEN_LABS_AGENT_ID")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Check for required environment variables
if not ELEVENLABS_API_KEY or not ELEVEN_LABS_AGENT_ID:
    raise ValueError("Missing required ElevenLabs environment variables")

app = FastAPI(title="Twilio-ElevenLabs Integration Server")

# Helper function to get Twilio client
def get_twilio_client():
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        raise HTTPException(status_code=500, detail="Twilio credentials not configured")
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.get("/")
async def root():
    return {"message": "Twilio-ElevenLabs Integration Server"}


@app.post("/outbound-call")
async def outbound_call(
    number: str = Form(...),
    request: Request = None,
    twilio_client: Client = Depends(get_twilio_client)
):
    if not TWILIO_PHONE_NUMBER:
        raise HTTPException(status_code=500, detail="Twilio phone number not configured")
    
    try:
        # Create URL for TwiML with proper URL encoding for parameters
        twiml_url = f"https://{request.headers.get('host')}/outbound-call-twiml"
        
        # Initiate the call via Twilio
        call = twilio_client.calls.create(
            from_=TWILIO_PHONE_NUMBER,
            to=number,
            url=twiml_url
        )
        
        return JSONResponse({
            "success": True,
            "message": "Call initiated",
            "callSid": call.sid
        })
    except Exception as e:
        print(f"Error initiating outbound call: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to initiate call",
                "details": str(e)
            }
        )

@app.get("/outbound-call-twiml")
@app.post("/outbound-call-twiml")
async def outbound_call_twiml(
    request: Request,
):
    response = VoiceResponse()
    connect = Connect()
    
    # Create a Stream with parameters
    stream = Stream(url=f"wss://{request.headers.get('host')}/outbound-media-stream",format="pcm16")
    
    connect.append(stream)
    response.append(connect)
    
    return HTMLResponse(content=str(response), media_type="application/xml")

@app.websocket("/outbound-media-stream")
async def handle_outbound_media_stream(websocket: WebSocket):
    await websocket.accept()
    print("Outbound WebSocket connection opened")
    
    # Variables to track the call
    stream_sid = None
    call_sid = None
    audio_interface = TwilioAudioInterface(websocket)
    eleven_labs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    conversation = None
    
    try:
        async for message in websocket.iter_text():
            if not message:
                print("Empty message received")
                continue
                
            print(f"Raw WebSocket message: {message[:200]}...") 
                
            data = json.loads(message)
            event_type = data.get("event")
            
            # Handle the start event
            if event_type == "start":
                stream_sid = data["start"]["streamSid"]
                call_sid = data["start"]["callSid"]
                custom_parameters = data["start"].get("customParameters", {})
                
                # Set stream_sid in audio interface
                audio_interface.stream_sid = stream_sid
                
                
                print(f"Outbound call started - StreamSid: {stream_sid}, CallSid: {call_sid}")
                
                # Initialize the conversation
                try:
                    conversation = Conversation(
                        client=eleven_labs_client,
                        agent_id=ELEVEN_LABS_AGENT_ID,
                        requires_auth=True,
                        audio_interface=audio_interface,
                        callback_agent_response=lambda text: print(f"Agent: {text}"),
                        callback_user_transcript=lambda text: print(f"User said: {text}"),
                    )

                    conversation.start_session()
                    print("ElevenLabs conversation started successfully")
                except Exception as e:
                    print(f"Error starting ElevenLabs conversation: {str(e)}")
                    traceback.print_exc()
                
            # Handle incoming media
            elif event_type == "media" and conversation:
                try:
                    await audio_interface.handle_twilio_message(data)
                except Exception as e:
                    print(f"Error handling audio: {str(e)}")
                    traceback.print_exc()
            
            # Handle stop event
            elif event_type == "stop":
                print(f"Call ended - StreamSid: {stream_sid}")
                if conversation:
                    try:
                        conversation.end_session()
                        print("ElevenLabs conversation ended")
                    except Exception as e:
                        print(f"Error ending conversation: {str(e)}")
    
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        traceback.print_exc()
        
    finally:
        if conversation:
            try:
                conversation.end_session()
                conversation.wait_for_session_end()
                print("Conversation cleanup completed")
            except Exception as e:
                print(f"Error in conversation cleanup: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)