# News Narration Automation

Convert news articles and security briefings into natural-sounding audio using ElevenLabs API.

## Overview

This example demonstrates how to automatically narrate news content - perfect for:
- Security briefings and alerts
- Daily news digests
- Market analysis reports
- Emergency notifications

## Features

- 📝 Text summarization for optimal narration
- 🎙️ High-quality voice synthesis
- 📄 Batch processing of multiple articles
- 💾 Audio file management
- 🔊 Multiple voice options

## Quick Start

### Prerequisites

```bash
pip install -r requirements.txt
```

### Set Environment Variables

```bash
export ELEVENLABS_API_KEY="your-api-key"
```

### Run Example

```bash
python narrate_news.py
```

## Files

- `narrate_news.py` - Main script for news narration
- `sample_briefing.txt` - Sample security briefing text
- `requirements.txt` - Python dependencies

## Usage

### Basic Narration

```python
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="your-api-key")

# Convert text to speech
audio = client.text_to_speech.convert(
    text="Security briefing: All clear in sector 7.",
    voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah
    model_id="eleven_multilingual_v2"
)

# Save to file
with open("briefing.mp3", "wb") as f:
    for chunk in audio:
        f.write(chunk)
```

### Batch Processing

```python
from narrate_news import narrate_articles

articles = [
    "Article 1 text...",
    "Article 2 text...",
]

narrate_articles(articles, output_dir="audio/")
```

## Voice Recommendations

| Use Case | Voice ID | Description |
|----------|----------|-------------|
| News | `EXAVITQu4vr4xnSDxMaL` | Professional female |
| Alerts | `TxGEqnHWrfWFTfGW9XjX` | Authoritative male |
| Briefings | `VR6AewLTigWG4xSOukaG` | Calm, measured |

## License

MIT - See main repository LICENSE
