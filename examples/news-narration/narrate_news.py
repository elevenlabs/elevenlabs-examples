#!/usr/bin/env python3
"""
News Narration Automation
Convert news articles and security briefings to audio using ElevenLabs API
"""
import os
import sys
from pathlib import Path
from typing import Optional

from elevenlabs import ElevenLabs
from elevenlabs.types import VoiceSettings


def narrate_text(
    text: str,
    output_path: str,
    voice_id: str = "EXAVITQu4vr4xnSDxMaL",
    model_id: str = "eleven_multilingual_v2",
    api_key: Optional[str] = None
) -> str:
    """
    Convert text to speech and save to file.
    
    Args:
        text: Text to narrate
        output_path: Path to save audio file
        voice_id: ElevenLabs voice ID
        model_id: Model to use
        api_key: ElevenLabs API key (or from env)
    
    Returns:
        Path to saved audio file
    """
    # Get API key
    api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY not set")
    
    # Initialize client
    client = ElevenLabs(api_key=api_key)
    
    # Generate audio
    print(f"🎙️  Generating audio for: {text[:50]}...")
    
    audio_iterator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.75
        )
    )
    
    # Save to file
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "wb") as f:
        for chunk in audio_iterator:
            f.write(chunk)
    
    print(f"✅ Saved to: {output_path}")
    return str(output_path)


def narrate_articles(
    articles: list[dict],
    output_dir: str = "audio_output",
    voice_id: str = "EXAVITQu4vr4xnSDxMaL"
) -> list[str]:
    """
    Narrate multiple articles.
    
    Args:
        articles: List of {"title": str, "content": str} dicts
        output_dir: Directory to save audio files
        voice_id: Voice to use
    
    Returns:
        List of saved file paths
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    saved_files = []
    
    for i, article in enumerate(articles, 1):
        # Prepare text
        title = article.get("title", f"Article {i}")
        content = article.get("content", "")
        
        # Combine title and content
        full_text = f"{title}. {content}"
        
        # Sanitize filename
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_title = safe_title.replace(' ', '_')[:50]
        
        output_path = output_dir / f"{i:03d}_{safe_title}.mp3"
        
        try:
            file_path = narrate_text(full_text, output_path, voice_id)
            saved_files.append(file_path)
        except Exception as e:
            print(f"❌ Error narrating '{title}': {e}")
    
    return saved_files


def main():
    """Example usage"""
    # Sample security briefing
    briefing_text = """
    Security Briefing Update.
    
    At 14:30 local time, routine patrol reported all clear in sectors 7 through 12.
    No incidents to report in the Gulf region for the past 6 hours.
    All monitoring systems operational.
    
    Weather conditions remain favorable.
    Visibility at 10 kilometers.
    
    Next scheduled update at 20:00 hours.
    End of briefing.
    """
    
    # Narrate the briefing
    output_file = "security_briefing.mp3"
    
    try:
        narrate_text(briefing_text.strip(), output_file)
        print(f"\n🎧 Audio saved: {output_file}")
        print("\nTo play:")
        print(f"  macOS: afplay {output_file}")
        print(f"  Linux: mpg123 {output_file}")
        print(f"  Windows: start {output_file}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
