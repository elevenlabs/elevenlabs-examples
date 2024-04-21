import os
import uuid

import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION_NAME = os.getenv("AWS_REGION_NAME")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

if (
    not AWS_ACCESS_KEY_ID
    or not AWS_SECRET_ACCESS_KEY
    or not AWS_REGION_NAME
    or not AWS_S3_BUCKET_NAME
):
    raise ValueError("AWS Environment variables not set properly")

session = boto3.Session(
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION_NAME,
)

s3 = session.client("s3")


def generate_presigned_url(s3_file_name: str) -> str:
    """
    Generates a presigned URL for an S3 object allowing temporary access without AWS credentials.

    Args:
        s3_file_name (str): The key name of the S3 object for which to generate the presigned URL.

    Returns:
        str: The generated presigned URL as a string.
    """
    signed_url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_S3_BUCKET_NAME, "Key": s3_file_name},
        ExpiresIn=3600,  # expires in 1 hour
    )
    return signed_url


def upload_audiostream_to_s3(audio_stream) -> str:
    """
    Uploads an audio stream to an S3 bucket.

    Args:
        audio_stream: The audio stream (file-like object) to be uploaded.

    Returns:
        str: The unique S3 file name under which the audio stream was saved.
    """
    s3_file_name = f"{uuid.uuid4()}.mp3"  # Generates a unique file name using UUID
    s3.upload_fileobj(audio_stream, AWS_S3_BUCKET_NAME, s3_file_name)

    return s3_file_name
