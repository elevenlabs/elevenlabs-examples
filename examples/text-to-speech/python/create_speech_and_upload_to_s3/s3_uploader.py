# s3_uploader.py

import os
import boto3
import uuid

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
REGION_NAME = os.getenv("REGION_NAME")

def generate_presigned_url(s3, bucket_name, s3_file_name):
    signed_url = s3.generate_presigned_url('get_object',
                                           Params={'Bucket': bucket_name, 'Key': s3_file_name},
                                           ExpiresIn=3600)
    return signed_url

def upload_audiostream_to_s3(audio_stream, bucket_name):
    s3_file_name = f"{uuid.uuid4()}.mp3"

    session = boto3.Session(
        aws_access_key_id = AWS_ACCESS_KEY_ID,
        aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
        region_name = REGION_NAME
    )
    s3 = session.client('s3')
    s3.upload_fileobj(audio_stream, bucket_name, s3_file_name)
    signed_url = generate_presigned_url(s3, bucket_name, s3_file_name)
    return signed_url