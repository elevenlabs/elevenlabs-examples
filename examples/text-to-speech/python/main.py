from text_to_speech import text_to_speech_stream
from s3_uploader import upload_audiostream_to_s3

def main():
    text = "<enter the text to convert into speech>"
    bucket_name = "<enter the bucket name>"

    audio_stream = text_to_speech_stream(text)
    signed_url = upload_audiostream_to_s3(audio_stream, bucket_name)

    print(f"Signed URL to access the file: {signed_url}")

if __name__ == "__main__":
    main()