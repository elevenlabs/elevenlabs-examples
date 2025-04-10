# ElevenLabs Conversational AI with Mem0 Integration

This demo shows how to integrate ElevenLabs Conversational AI with Mem0 to create a voice agent with memory capabilities.

## What is Mem0?

Mem0 is a memory storage service that allows agents to remember past interactions and retrieve relevant context during conversations. This creates more personalized and context-aware conversations with users.

## Prerequisites

- ElevenLabs API key
- Mem0 API key
- Python 3.8+
- A conversational AI agent created in the ElevenLabs platform

## Quick Setup

1. **Install dependencies**:

```bash
pip install -r requirements.txt
```

2. **Set up environment variables**:

Create a `.env` file with the following variables:

```
AGENT_ID=your-agent-id
USER_ID=unique-user-identifier
ELEVENLABS_API_KEY=your-elevenlabs-api-key
MEM0_API_KEY=your-mem0-api-key
```

Alternatively, you can set these variables in your environment:

```bash
export AGENT_ID=your-agent-id
export USER_ID=unique-user-identifier
export ELEVENLABS_API_KEY=your-elevenlabs-api-key
export MEM0_API_KEY=your-mem0-api-key
```

3. **Run the application**:

```bash
python main.py
```

## Memory Tools Overview

This integration provides two key memory functions to your conversational AI agent:

### 1. Adding Memories (`addMemories`)

![Add Memories Tool](/examples/conversational-ai/mem0/images/addmemories.png)

The `addMemories` tool allows your agent to store important information during a conversation. This could include:
- User preferences
- Important facts shared by the user
- Decisions or commitments made
- Action items to follow up on

When the agent identifies information worth remembering, it calls this function to store it in the Mem0 database with the appropriate user ID.

### 2. Retrieving Memories (`retrieveMemories`)

![Retrieve Memories Tool](/examples/conversational-ai/mem0/images/retrieveMemories.png)

The `retrieveMemories` tool allows your agent to search for and retrieve relevant memories from previous conversations. The agent can:
- Search for context related to the current topic
- Recall user preferences
- Remember previous interactions on similar topics
- Create continuity across multiple sessions

The search function uses semantic matching to find the most relevant memories to the current conversation context.

## Example Use Cases

- **Personal Assistant** - Remember user preferences, past requests, and important dates
- **Customer Support** - Recall previous issues a customer has had
- **Educational AI** - Track student progress and tailor teaching accordingly

## Customizing Your Agent

To enable your agent to effectively use memory:

1. Add function calling capabilities to your agent in the ElevenLabs platform:
   - Go to your agent settings in the ElevenLabs platform
   - Navigate to the "Tools" section
   - Enable function calling for your agent
   - Add the memory tools as described below

2. Add the addMemories and retrieveMemories tools to your agent.

3. Update your agent's prompt to instruct it to use these memory functions.

Example prompt addition:
```
You have access to memory tools that allow you to remember important information:
- Use retrieveMemories to recall relevant context from prior conversations
- Use addMemories to store new important information
```

## Example Conversation Flow

1. User speaks to the agent
2. Agent uses `retrieveMemories` to check for relevant context
3. Agent processes the request with this context in mind
4. Agent responds to the user
5. Agent uses `addMemories` to store important new information from the exchange

## Troubleshooting

- **Missing API Keys**: Ensure all environment variables are set correctly
- **Connection Issues**: Check your network connection and API key permissions
- **Empty Memory Results**: This is normal for new users or when no relevant memories exist

## Documentation

For detailed setup instructions and API references, please refer to:

- [ElevenLabs Conversational AI Documentation](https://elevenlabs.io/docs/api-reference/conversational-ai)
- [Mem0 API Documentation](https://docs.mem0.ai)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 