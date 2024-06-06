import json
import boto3
import uuid
import base64

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('serverless-recipe-table')
s3_bucket = "serverless-recipe-bucket"

def lambda_handler(event, context):
    body = json.loads(event['body'])
    
    # Generating a unique ID for the new item
    item_id = str(uuid.uuid4())
    
    # Creating the item to be inserted into DynamoDB
    item = {'id': item_id, 'text': body['text']}
    
    # Handling image upload if 'image' and 'image_mime' are provided in the request
    if 'image' in body and 'image_mime' in body:
        image_data = base64.b64decode(body['image'])
        
        # Generating the S3 key for the image using the item ID and image MIME type
        s3_key = f"{item_id}.{body['image_mime'].split('/')[-1]}"
        
        # Uploading the image to S3
        s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=image_data, ContentType=body['image_mime'])
        
        # Constructing the image URL
        item['image_url'] = f"https://{s3_bucket}.s3.amazonaws.com/{s3_key}"
    
    # Inserting the item into the DynamoDB table
    table.put_item(Item=item)
    
    return {'statusCode': 200, 'body': json.dumps(item)}
