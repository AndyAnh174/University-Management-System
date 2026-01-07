import boto3
from botocore.client import Config
import os
from datetime import datetime

# Configuration matching .env and docker-compose
MINIO_ENDPOINT = "http://localhost:9000"
ACCESS_KEY = "admin"
SECRET_KEY = "secure_minio_password"
BUCKET_NAME = "university-storage"

def test_minio_connection():
    print(f"--- Connecting to MinIO at {MINIO_ENDPOINT} ---")
    
    s3 = boto3.resource('s3',
                    endpoint_url=MINIO_ENDPOINT,
                    aws_access_key_id=ACCESS_KEY,
                    aws_secret_access_key=SECRET_KEY,
                    config=Config(signature_version='s3v4')
                    )

    # 1. Check if bucket exists
    print(f"Checking bucket '{BUCKET_NAME}'...")
    try:
        if s3.Bucket(BUCKET_NAME) in s3.buckets.all():
            print(f"✅ Bucket '{BUCKET_NAME}' exists.")
        else:
            print(f"❌ Bucket '{BUCKET_NAME}' does not exist.")
            return
    except Exception as e:
        print(f"❌ Error connecting to MinIO: {e}")
        return

    # 2. Test Upload
    test_filename = "test_upload.txt"
    with open(test_filename, "w") as f:
        f.write(f"Hello MinIO! Timestamp: {datetime.now()}")
    
    print(f"\nUploading '{test_filename}'...")
    try:
        s3.Bucket(BUCKET_NAME).upload_file(test_filename, test_filename)
        print("✅ Upload successful.")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        os.remove(test_filename)
        return

    # 3. Test Presigned URL (Download)
    print("\nGenerating Presigned URL...")
    try:
        s3_client = boto3.client('s3',
                        endpoint_url=MINIO_ENDPOINT,
                        aws_access_key_id=ACCESS_KEY,
                        aws_secret_access_key=SECRET_KEY,
                        config=Config(signature_version='s3v4')
                        )
        
        url = s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': test_filename
            },
            ExpiresIn=3600
        )
        print(f"✅ Presigned URL generated:\n{url}")
    except Exception as e:
        print(f"❌ Failed to generate URL: {e}")

    # Cleanup
    try:
        os.remove(test_filename)
        print("\n(Local test file cleaned up)")
    except:
        pass

if __name__ == "__main__":
    try:
        import boto3
        test_minio_connection()
    except ImportError:
        print("❌ 'boto3' library is missing. Install it with: pip install boto3")
