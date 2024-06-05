import json
import boto3
import uuid
import base64
import mimetypes

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('serverless-recipe-table')
s3_bucket = "serverless-recipe-bucket"

def lambda_handler(event, context):
    body = json.loads(event['body'])
    item_id = str(uuid.uuid4())
    item = {
        'id': item_id,
        'text': body['text']
    }
    
    # Handle image upload
    if 'image' in body and 'image_mime' in body:
        image_data = base64.b64decode(body['image'])
        s3_key = f"{item_id}.{body['image_mime'].split('/')[-1]}"
        s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=image_data, ContentType=body['image_mime'])
        image_url = f"https://{s3_bucket}.s3.amazonaws.com/{s3_key}"
        item['image_url'] = image_url
    
    table.put_item(Item=item)
    
    return {
        'statusCode': 200,
        'body': json.dumps(item)
    }
