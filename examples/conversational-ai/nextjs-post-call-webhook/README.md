# Data Collection and Analysis with Conversational AI in Next.js

Collect and analyse data in post-call webhooks using Conversational AI and Next.js.

## Run locally

```
pnpm i
pnpm dev
```

## Conversational AI agent configuration

Navigate to the [Conversational AI Agent settings](https://elevenlabs.io/app/conversational-ai/agents) within the ELevenLabs App, and create a new AI agent from the "Blank Template".

### First message

```
Hi {{user_name}}, I'm Hope from the ElevenLabs team. I'm here to help you design your very own conversational AI agent! To kick things off, let me know what kind of agent you're looking to create. For example, do you want a support agent, to help your users answer questions, or a sales agent to sell your products, or just a friend to chat with?
```

### System prompt

```
You are Hope, a helpful agent helping {{user_name}} to design their very own conversational AI agent. The design process involves the following steps:

"initial": In the first step, collect the information about the kind of agent the user is looking to create. Summarize the user's needs back to them and ask if they are ready to continue to the next step. Only once they confirm proceed to the next step.
"training": Tell the user to create the agent's knowledge base by uploading documents, or submitting URLs to public websites with information that should be available to the agent. Wait patiently without talking to the user. Only when the user confirms that they've provided everything then proceed to the next step.
"voice": Tell the user to describe the voice they want their agent to have. For example: "A professional, strong spoken female voice with a slight British accent." Repeat the description of their voice back to them and ask if they are ready to continue to the next step. Only once they confirm proceed to the next step.
"email": Tell the user that we've collected all necessary information to create their conversational AI agent and ask them to provide their email address to get notified when the agent is ready.

Always call the `set_ui_state` tool when moving between steps!
```

### Tools

- Client
- Configuration
  - Name: set_ui_state
  - Description: Use this client-side tool to navigate between the different UI states.
  - Wait for response: true
  - Response timeout (seconds): 1
  - Parameters:
    - Data type: string
    - Identifier: step
    - Required: true
    - Value Type: LLM Prompt
    - Description: The step to navigate to in the UI. Only use the steps that are defined in the system prompt!

## Evaluation criteria

- name: all_data_provided
- Prompt: Evaluate whether the user provided a description of the agent they are looking to generate as well as a description of the voice the agent should have.

## Data collection

1. `agent_description`

- Data type: string
- Identifier: agent_description
- Description: Based on the description about the agent the user is looking to design, generate a prompt that can be used to train a model to act as the agent.

2. `voice_description`

- Data type: string
- Identifier: voice_description
- Description: Based on the description of the voice the user wants the agent to have, generate a concise description of the voice including the age, accent, tone, and character if available.

## Post-call webhook

[Post-call webhooks](https://elevenlabs.io/docs/conversational-ai/workflows/post-call-webhooks) are used to notify you when a call ends and the analysis and data extraction steps have been completed.

In this example the, the post-call webhook does a couple of steps, namely:

1. Create a custom voice design based on the `voice_description`.
2. Create a conversational AI agent for the users based on the `agent_description` they provided.
3. Retrieve the knowledge base documents from the conversation state stored in Redis and attach the knowledge base to the agent.
4. Send an email to the user to notify them that their custom conversational AI agent is ready to chat.

When running locally, you will need a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet.

```bash
ngrok http 3000
```

Navigate to the [Conversational AI settings](https://elevenlabs.io/app/conversational-ai/settings) and under "Post-Call Webhook" create a new webhook and paste in your ngrok URL: `https://<your-url>.ngrok-free.app/api/convai-webhook`.

After saving the webhook, you will receive a webhooks secret. Make sure to store this secret securely as you will need to set it in your `.env` file later.

## Conclusion

[ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai) is a powerful platform for building advanced voice agent uses cases, complete with data collection and analysis.
