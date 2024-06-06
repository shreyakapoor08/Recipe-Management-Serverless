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
    
    # Preparing the update expression for updating the text field
    update_expression = "set #text = :text"
    expression_attribute_names = {'#text': 'text'}
    expression_attribute_values = {':text': body['text']}
    
    # Handling image upload if 'image' and 'image_mime' are provided in the request
    if 'image' in body and 'image_mime' in body:
        # Decoding the base64-encoded image data
        image_data = base64.b64decode(body['image'])
        
        # Generating the S3 key for the image using the item ID and image MIME type
        s3_key = f"{body['id']}.{body['image_mime'].split('/')[-1]}"
        
        # Uploading the image to S3
        s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=image_data, ContentType=body['image_mime'])
        
        # Constructing the image URL
        image_url = f"https://{s3_bucket}.s3.amazonaws.com/{s3_key}"
        
        # Adding the image URL update to the update expression
        update_expression += ", image_url = :image_url"
        expression_attribute_values[':image_url'] = image_url
    
    # Updating the item in the DynamoDB table
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
