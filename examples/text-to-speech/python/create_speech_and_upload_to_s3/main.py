import os

from dotenv import load_dotenv

load_dotenv()

from text_to_speech_stream import text_to_speech_stream
from s3_uploader import upload_audiostream_to_s3, generate_presigned_url


def main():
    text = "This is James"
    AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

    audio_stream = text_to_speech_stream(text)
    s3_file_name = upload_audiostream_to_s3(audio_stream, AWS_S3_BUCKET_NAME)
    signed_url = generate_presigned_url(AWS_S3_BUCKET_NAME, s3_file_name)

    print(f"Signed URL to access the file: {signed_url}")


if __name__ == "__main__":
    main()
