# ElevenLabs Conversational AI - Twilio Integration w/ FastAPI

This demo shows how to integrate ElevenLabs Conversational AI with Twilio to create an interactive voice agent that can handle phone calls.

## Prerequisites

- ElevenLabs API key
- Twilio account & phone number
- Python 3.7+
- A static ngrok URL for local development

## Quick Setup

1. Install dependencies:

```bash
pip install fastapi uvicorn python-dotenv twilio elevenlabs websockets
```

2. Configure environment:
   - Copy `.env.example` to `.env`
   - Add your ElevenLabs API key and Agent ID

3. Start the server:

```bash
python main.py
```

4. Use ngrok to create a public URL:
```bash
ngrok http --url=<your-static-url> 8000  
```

5. Configure your Twilio webhook:
   - Go to your Twilio Phone Number settings
   - Set the webhook URL for incoming calls to: `{your-ngrok-url}/incoming-call-eleven`
   - Make sure the HTTP method is set to POST

## Testing

1. Call your Twilio phone number
2. The agent should answer and begin the conversation
3. Monitor the console logs for any potential issues

## Project Structure

```
.
├── main.py                    # FastAPI server and main application logic
├── twilio_audio_interface.py  # Twilio audio streaming implementation
├── .env                       # Environment variables (create from .env.example)
```

## Troubleshooting

- Ensure all environment variables are properly set
- Check ngrok connection is active and URL is correct
- Verify Twilio webhook configuration
- Monitor server logs for detailed error messages

## Documentation

For detailed setup instructions and troubleshooting, please refer to the [official ElevenLabs Twilio Integration Guide](https://elevenlabs.io/docs/conversational-ai/guides/conversational-ai-twilio).

## License

This project is licensed under the MIT License - see the LICENSE file for details.