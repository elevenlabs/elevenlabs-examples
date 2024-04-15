# s3_uploader.py

import boto3
import uuid

def upload_audiostream_to_s3(audio_stream, bucket_name):
    s3_file_name = f"{uuid.uuid4()}.mp3"

    session = boto3.Session("<enter your aws credentials: aws_access_key_id, aws_secret_access_key, region_name>")
    s3 = session.client('s3')
    s3.upload_fileobj(audio_stream, bucket_name, s3_file_name)
    signed_url = s3.generate_presigned_url('get_object',
                                           Params={'Bucket': bucket_name, 'Key': s3_file_name},
                                           ExpiresIn=3600)
    return signed_url