# s3_uploader.py

import os
import boto3
import uuid

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION_NAME = os.getenv("AWS_REGION_NAME")

session = boto3.Session(
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION_NAME,
)
s3 = session.client("s3")


def generate_presigned_url(bucket_name: str, s3_file_name: str) -> str:
    """
    Generates a presigned URL for an S3 object allowing temporary access without AWS credentials.

    Args:
        bucket_name (str): The name of the S3 bucket.
        s3_file_name (str): The key name of the S3 object for which to generate the presigned URL.

    Returns:
        str: The generated presigned URL as a string.
    """
    signed_url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": s3_file_name},
        ExpiresIn=3600,
    )  # URL expires in 1 hour
    return signed_url


def upload_audiostream_to_s3(audio_stream, bucket_name: str) -> str:
    """
    Uploads an audio stream to an S3 bucket.

    Args:
        audio_stream: The audio stream (file-like object) to be uploaded.
        bucket_name (str): The name of the S3 bucket where the audio stream will be uploaded.

    Returns:
        str: The unique S3 file name under which the audio stream was saved.
    """
    s3_file_name = f"{uuid.uuid4()}.mp3"  # Generates a unique file name using UUID
    s3.upload_fileobj(audio_stream, bucket_name, s3_file_name)

    return s3_file_name
