import os
import tempfile
from elevenlabs import SoundGenerationSettingsResponseModel
from elevenlabs.client import ElevenLabs

from dotenv import load_dotenv
import cv2
from moviepy.editor import VideoFileClip, AudioFileClip

import base64
import requests
import os
from datetime import datetime

load_dotenv()

elevenlabs = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"), base_url="http://localhost:8000"
)


def get_caption_for_image(image_path: str, prompt: str):

    # Function to encode the image
    def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    # Getting the base64 string
    base64_image = encode_image(image_path)

    OPENAPI_KEY = os.getenv("OPENAPI_KEY")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAPI_KEY}",
    }

    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 300,
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )

    try:
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise Exception(f"Failed to get caption for image: {e}")


def generate_sound_effect(text: str, output_path: str):
    print("Generating sound effects...")

    result = elevenlabs.text_to_sound_effect.convert(
        text=text,
        generation_settings=SoundGenerationSettingsResponseModel(
            duration_seconds=10,  # Optional
            prompt_influence=0.3,  # Optional
        ),
    )

    with open(output_path, "wb") as f:
        for chunk in result:
            f.write(chunk)

    print(f"Audio saved to {output_path}")


def get_first_frame_from_video_and_save_as_image(video_path: str, output_path: str):
    video = cv2.VideoCapture(video_path)
    _, frame = video.read()
    cv2.imwrite(output_path, frame)


def combine_video_and_sound(video_path: str, sound_path: str, output_path: str):
    # Load the video file
    video_clip = VideoFileClip(video_path)
    # Load the sound file
    audio_clip = AudioFileClip(sound_path)
    if audio_clip.duration > video_clip.duration:
        audio_clip = audio_clip.set_duration(video_clip.duration)
    elif video_clip.duration > audio_clip.duration:
        video_clip = video_clip.subclip(0, audio_clip.duration)
    # Set the audio of the video clip as the audio clip
    video_clip = video_clip.set_audio(audio_clip)
    # Write the result to a file
    video_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")


def open_file_mac(output_path: str):
    import subprocess

    # Open the output video using the default video player on the system
    subprocess.run(["open", output_path])


def generate_video_with_sound_effect(
    INPUT_VIDEO_PATH, OUTPUT_DIR, TEMP_DIR, caption, file_name
):
    sound_effect_path = f"{TEMP_DIR}/{file_name}.mp3"
    output_video_path = f"{OUTPUT_DIR}/{file_name}.mp4"
    generate_sound_effect(caption, sound_effect_path)

    combine_video_and_sound(INPUT_VIDEO_PATH, sound_effect_path, output_video_path)

    os.remove(sound_effect_path)

    open_file_mac(output_video_path)

    return output_video_path


if __name__ == "__main__":
    NUM_VIDEOS = 4
    INPUT_VIDEO_PATH = "/Users/luke/dev/elevenlabs-examples/examples/sound-effects/python-video-to-sfx/video.mp4"
    OUTPUT_DIR = "/Users/luke/dev/elevenlabs-examples/examples/sound-effects/python-video-to-sfx/output"
    TEMP_DIR = tempfile.mkdtemp()
    IMAGE_PATH = f"{TEMP_DIR}/frame.jpg"

    PROMPT = """Act as an expert prompt engineer

Understand what's in this video and create a prompt for a video to SFX model

Give short prompts that only include the details needed for the main sound in the video"""

    get_first_frame_from_video_and_save_as_image(INPUT_VIDEO_PATH, IMAGE_PATH)

    caption = get_caption_for_image(IMAGE_PATH, PROMPT)
    print("Caption: ", caption)

    for i in range(NUM_VIDEOS):
        output_video_path = generate_video_with_sound_effect(
            INPUT_VIDEO_PATH,
            OUTPUT_DIR,
            TEMP_DIR,
            caption,
            f"output_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}",
        )

    print(f"Done, saved to {OUTPUT_DIR}")
