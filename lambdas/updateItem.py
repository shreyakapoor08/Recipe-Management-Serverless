import json
import boto3
import base64
import mimetypes

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('serverless-recipe-table')
s3_bucket = "serverless-recipe-bucket"

def lambda_handler(event, context):
    body = json.loads(event['body'])
    
    update_expression = "set #text = :text"
    expression_attribute_names = {'#text': 'text'}
    expression_attribute_values = {':text': body['text']}
    
    # Handle image upload
    if 'image' in body and 'image_mime' in body:
        image_data = base64.b64decode(body['image'])
        s3_key = f"{body['id']}.{body['image_mime'].split('/')[-1]}"
        s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=image_data, ContentType=body['image_mime'])
        image_url = f"https://{s3_bucket}.s3.amazonaws.com/{s3_key}"
        update_expression += ", image_url = :image_url"
        expression_attribute_values[':image_url'] = image_url
    
    response = table.update_item(
        Key={'id': body['id']},
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expression_attribute_names,
        ExpressionAttributeValues=expression_attribute_values,
        ReturnValues="UPDATED_NEW"
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(response['Attributes'])
    }
