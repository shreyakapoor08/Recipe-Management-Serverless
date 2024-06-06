import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('serverless-recipe-table')
    
    # Scanning the table to retrieve all items
    response = table.scan()

    # Extracting items from the scan response
    items = response['Items']
    
    return {
        'statusCode': 200,
        'body': json.dumps(items)
    }
