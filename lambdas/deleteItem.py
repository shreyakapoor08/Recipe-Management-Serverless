import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('serverless-recipe-table')
    
    # Print the event for debugging
    print("Event: ", json.dumps(event))
    
    # Get the ID from the path parameters
    id = event['requestContext']['http']['path'].split("/")[1]
    
    # Delete the item from DynamoDB
    response = table.delete_item(
        Key={
            'id': id
        }
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({'deleted': True})
    }
