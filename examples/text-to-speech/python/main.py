from dotenv import load_dotenv
from s3_uploader import generate_presigned_url, upload_audiostream_to_s3
from text_to_speech_stream import text_to_speech_stream

load_dotenv()


def main(text: str):
    audio_stream = text_to_speech_stream(text)
    s3_file_name = upload_audiostream_to_s3(audio_stream)
    signed_url = generate_presigned_url(s3_file_name)

    print(f"Signed URL to access the file: {signed_url}")


if __name__ == "__main__":
    main("This is a test of the ElevenLabs API.")
