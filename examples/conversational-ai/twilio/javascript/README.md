# ElevenLabs Conversational AI - Twilio Integration (Javascript)

This demo shows how to integrate ElevenLabs Conversational AI with Twilio to create an interactive voice agent that can handle phone calls.

## Prerequisites

- ElevenLabs API key
- Twilio account & phone number
- Node
- A static ngrok URL for local development

## Quick Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:
   - Copy `.env.example` to `.env`
   - Add your ElevenLabs Agent ID

3. Start the server:

```bash
node index.js
```

4. In a new terminal, use ngrok to create a public URL:
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

## Troubleshooting

- Ensure the environment variable is properly set
- Check ngrok connection is active and URL is correct
- Verify Twilio webhook configuration
- Monitor server logs for detailed error messages

## Documentation

For detailed setup instructions and troubleshooting, please refer to the [official ElevenLabs Twilio Integration Guide](https://elevenlabs.io/docs/conversational-ai/guides/conversational-ai-twilio).

## License

This project is licensed under the MIT License - see the LICENSE file for details.