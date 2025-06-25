# Twitter AI Twin Creator

Create an AI twin of any Twitter/X profile using ElevenLabs Conversational AI. This app analyzes Twitter profiles, clones voices, and creates AI agents that embody someone's online persona.

## Features

- 🔍 **Profile Analysis**: Get detailed summaries of any Twitter/X profile using Perplexity AI
- 🎯 **Targeted Research**: Automatically identifies and researches key conversation topics for deeper knowledge
- 🎙️ **Voice Cloning**: Record a voice sample to create an instant voice clone
- 🤖 **AI Twin Creation**: Combine profile data and voice to create a conversational AI agent
- 💬 **Natural Conversations**: Chat with AI twins that sound and think like their Twitter personas
- ⚡ **Instant Setup**: No complex configuration - just enter a username and record

## How It Works

1. **Enter Username**: Replace `x.com/username` with `yoursite.com/username` or use the form
2. **Automatic Research**: The app immediately begins comprehensive research:
   - Analyzes the Twitter profile
   - Identifies top 5 conversation topics
   - Conducts targeted research on each topic
   - Builds a knowledge base (all happening in parallel)
3. **Voice Recording**: While research runs, record your 30-60 second voice sample
4. **AI Twin Creation**: Once both research and voice are ready, the app automatically creates your AI twin with:
   - Your cloned voice
   - Comprehensive knowledge from profile and targeted research
   - Deep understanding of key topics
   - Personality traits from the analysis

The parallel processing saves time - research happens in the background while you record!

## Setup

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Set up Environment Variables**
   Create a `.env.local` file:

   ```bash
   PPLX_API_KEY=sk-your-perplexity-api-key
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

3. **Run the Development Server**

   ```bash
   pnpm dev
   ```

4. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Keys Required

### Perplexity API

- Visit [Perplexity AI](https://docs.perplexity.ai/guides/getting-started)
- Create an account and add billing info
- Generate an API key

### ElevenLabs API

- Visit [ElevenLabs](https://elevenlabs.io)
- Create an account
- Go to your profile settings
- Generate an API key

### OpenAI API

- Visit [OpenAI Platform](https://platform.openai.com)
- Create an account
- Go to API keys section
- Generate an API key

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Profile Analysis**: Perplexity AI (sonar-pro model)
- **Topic Analysis**: OpenAI GPT-4.1
- **Voice & AI**: ElevenLabs Conversational AI
  - Instant Voice Cloning (IVC)
  - Knowledge Base
  - Agent Creation

## API Endpoints

- `/api/perplexity` - Profile analysis
- `/api/analyze-topics` - Extract key conversation topics
- `/api/targeted-research` - Deep research on specific topics
- `/api/elevenlabs/voice` - Voice cloning
- `/api/elevenlabs/knowledge` - Knowledge base creation
- `/api/elevenlabs/agent` - AI agent creation

## Features Breakdown

### Profile Summary

- Comprehensive analysis of Twitter/X profiles
- Real-time data using Perplexity's web search
- Structured information about interests, expertise, and personality

### Targeted Research

- AI identifies top 5 conversation topics from profile
- Conducts deep research on each topic
- Builds comprehensive knowledge base with specific details
- Enables AI twins to answer detailed questions about their work

### Voice Cloning

- Browser-based audio recording
- 30-60 second sample for best results
- Instant voice clone creation

### AI Twin

- Combines voice and knowledge for authentic interactions
- Personality-aware responses
- Deep knowledge of specific topics and projects
- Access through ElevenLabs Conversational AI platform

---

Built with ❤️ using Next.js, Perplexity AI, OpenAI, and ElevenLabs
