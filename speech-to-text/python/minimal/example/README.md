# ElevenLabs Speech-to-Text — Minimal Python Example

Transcribe audio to text using ElevenLabs Scribe v2.

## Setup

1. Copy the example env file and add your API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your [ElevenLabs API key](https://elevenlabs.io/app/settings/api-keys).

2. Create a virtual environment and install dependencies:

   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```

## Run

Transcribe the bundled quickstart sample:

```bash
.venv/bin/python main.py
```

Transcribe a local file:

```bash
.venv/bin/python main.py ./audio.mp3
```
