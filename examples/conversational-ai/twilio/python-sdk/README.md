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

### Setting Environment Variables

You need to export the following environment variables:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`

You can do this in your terminal:

```bash
export ELEVENLABS_API_KEY='your_api_key_here'
export ELEVENLABS_AGENT_ID='your_agent_id_here'

# Twilio outbound calling
export TWILIO_ACCOUNT_SID='your_account_sid_here'
export TWILIO_AUTH_TOKEN='your_auth_token_here'
export TWILIO_PHONE_NUMBER='your_twilio_phone_number_here'
```

Alternatively, you can use a `.env` file with the `python-dotenv` package. Create a `.env` file in your project root and add:

```
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_AGENT_ID=your_agent_id_here

# Twilio outbound calling
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## Running the Application

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

### Outbound Calling

1. Make a request to the `/outbound-call` endpoint with the prompt you want to use:

```bash
curl -X POST https://<your-ngrok-url>/outbound-call \
-H "Content-Type: application/json" \
-d '{
   "prompt": "You are Eric, an outbound car sales agent. You are calling to sell a new car to the customer. Be friendly and professional and answer all questions.",
   "first_message": "Hello Thor, my name is Eric, I heard you were looking for a new car! What model and color are you looking for?",
   "number": "number-to-call"
   }'
```
