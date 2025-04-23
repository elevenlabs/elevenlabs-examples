import os
import signal
import sys
from mem0 import AsyncMemoryClient

from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface
from elevenlabs.conversational_ai.conversation import ClientTools


def main():
    # Required environment variables
    AGENT_ID = os.environ.get('AGENT_ID')
    USER_ID = os.environ.get('USER_ID')
    API_KEY = os.environ.get('ELEVENLABS_API_KEY')
    MEM0_API_KEY = os.environ.get('MEM0_API_KEY')

    # Validate required environment variables
    if not AGENT_ID:
        sys.stderr.write("AGENT_ID environment variable must be set\n")
        sys.exit(1)

    if not USER_ID:
        sys.stderr.write("USER_ID environment variable must be set\n")
        sys.exit(1)

    if not API_KEY:
        sys.stderr.write("ELEVENLABS_API_KEY not set, assuming the agent is public\n")

    if not MEM0_API_KEY:
        sys.stderr.write("MEM0_API_KEY environment variable must be set\n")
        sys.exit(1)

    # Set up Mem0 API key in the environment
    os.environ['MEM0_API_KEY'] = MEM0_API_KEY

    # Initialize ElevenLabs client
    client = ElevenLabs(api_key=API_KEY)
    
    # Initialize memory client and tools
    client_tools = ClientTools()
    mem0_client = AsyncMemoryClient()
    
    # Define memory-related functions for the agent
    async def add_memories(parameters):
        """Add a message to the memory store"""
        message = parameters.get("message")
        await mem0_client.add(
            messages=message, 
            user_id=USER_ID, 
            output_format="v1.1", 
            version="v2"
        )
        return "Memory added successfully"

    async def retrieve_memories(parameters):
        """Retrieve relevant memories based on the input message"""
        message = parameters.get("message")
        
        # Set up filters to retrieve memories for this specific user
        filters = {
            "AND": [
                {
                    "user_id": USER_ID
                }
            ]
        }
        
        # Search for relevant memories using the message as a query
        results = await mem0_client.search(
            query=message,
            version="v2", 
            filters=filters
        )
        
        # Extract and join the memory texts
        memories = ' '.join([result["memory"] for result in results])
        print("[ Memories ]", memories)
        
        if memories:
            return memories
        return "No memories found"
    
    # Register the memory functions as tools for the agent
    client_tools.register("addMemories", add_memories, is_async=True)
    client_tools.register("retrieveMemories", retrieve_memories, is_async=True)
    
    # Initialize the conversation
    conversation = Conversation(
        client,
        AGENT_ID,
        # Assume auth is required when API_KEY is set
        requires_auth=bool(API_KEY),
        audio_interface=DefaultAudioInterface(),
        client_tools=client_tools,
        callback_agent_response=lambda response: print(f"Agent: {response}"),
        callback_agent_response_correction=lambda original, corrected: print(f"Agent: {original} -> {corrected}"),
        callback_user_transcript=lambda transcript: print(f"User: {transcript}"),
        # callback_latency_measurement=lambda latency: print(f"Latency: {latency}ms"),
    )
    
    # Start the conversation
    print(f"Starting conversation with user_id: {USER_ID}")
    conversation.start_session()

    # Handle Ctrl+C to gracefully end the session
    signal.signal(signal.SIGINT, lambda sig, frame: conversation.end_session())

    # Wait for the conversation to end and get the conversation ID
    conversation_id = conversation.wait_for_session_end()
    print(f"Conversation ID: {conversation_id}")


if __name__ == '__main__':
    main()