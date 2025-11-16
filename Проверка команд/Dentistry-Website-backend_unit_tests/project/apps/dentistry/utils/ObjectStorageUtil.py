from io import BytesIO

import boto3
from botocore.client import Config

from decouple import config

# Параметры подключения
ACCESS_KEY = config('CLOUD_ACCESS_KEY')
TENANT_ID = config('CLOUD_TENANT_ID')
SECRET_KEY = config('CLOUD_SECRET_KEY')
ENDPOINT_URL = 'https://s3.cloud.ru'
REGION_NAME = 'ru-central-1'
BUCKET_NAME = 'dentistry'

s3_client = boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=f'{TENANT_ID}:{ACCESS_KEY}',
        aws_secret_access_key=SECRET_KEY,
        region_name=REGION_NAME,
        config=Config(signature_version='s3v4')
    )

def upload_file_to_cloud(file, filename, folder='avatars'):
    filename = f"{folder}/{filename}"
    bucket = BUCKET_NAME

    s3_client.upload_fileobj(
        file,
        bucket,
        filename,
        ExtraArgs={'ContentType': file.content_type}
    )

    return filename
