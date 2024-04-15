from dotenv import load_dotenv
load_dotenv()

from text_to_speech_stream import text_to_speech_stream
from s3_uploader import upload_audiostream_to_s3

def main():
    text = "This is James"
    bucket_name = "<enter your bucket name: ex. elevenlabs-examples>"

    audio_stream = text_to_speech_stream(text)
    signed_url = upload_audiostream_to_s3(audio_stream, bucket_name)

    print(f"Signed URL to access the file: {signed_url}")

if __name__ == "__main__":
    main()