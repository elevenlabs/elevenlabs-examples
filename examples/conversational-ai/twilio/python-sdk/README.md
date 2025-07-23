# Conversational AI Twilio Python SDK

## Getting Started

### Setting Up the Environment

1. **Create a Virtual Environment**  
   Navigate to your project directory and create a virtual environment:

   ```bash
   python -m venv venv
   ```

2. **Activate the Virtual Environment**

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install Requirements**  
   Install the necessary packages using pip:

   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

To start the application, run the following command:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

In your code, ensure that the `requires_auth` parameter is set correctly in the `Conversation` instantiation. It should have the same value as the settings of your agent.

### Tunneling through ngrok

```bash
ngrok http 8000
```

- Set webhook: https://<ngrok-url>/twilio/inbound_call

### Setting Environment Variables

You need to export the following environment variables:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`

You can do this in your terminal:

```bash
export ELEVENLABS_API_KEY='your_api_key_here'
export ELEVENLABS_AGENT_ID='your_agent_id_here'
```


### Outbound Call
1. You need to export the following environment variables:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

You can do this in your terminal:

```bash
export ELEVENLABS_API_KEY='your_api_key_here'
export ELEVENLABS_AGENT_ID='your_agent_id_here'
export TWILIO_ACCOUNT_SID='your_twilio_account_sid_here'
export TWILIO_AUTH_TOKEN='your_twilio_auth_token_here'
export TWILIO_PHONE_NUMBER='your_twilio_phone_number_here'
```
2. Start the server: `python outbound.js`
3. `ngrok http --url=<your-static-url> 8000`
4. Make a request to the `/outbound-call` endpoint with the prompt you want to use:

```bash
curl -X POST https://<your-ngrok-url>/outbound-call \
-H "Content-Type: application/json" \
-d '{
   "number": "number-to-call"
   }'
```

Alternatively, you can use a `.env` file with the `python-dotenv` package. Create a `.env` file in your project root and add:

```
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```
