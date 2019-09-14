import * as AWS from 'aws-sdk';

const options = {
  endpoint: 'http://localhost:8000',
  region: 'localhost',
};

const isOffline = function() {
  if (process.env.hasOwnProperty('IS_OFFLINE')) {
    return process.env.IS_OFFLINE;
  }
  // Depends on serverless-offline plugion which adds IS_OFFLINE to process.env when running offline
  return false;
};

const dynamodb = () =>
  (isOffline() as boolean)
    ? new AWS.DynamoDB.DocumentClient(options)
    : new AWS.DynamoDB.DocumentClient();

export const dynamoDbClient = dynamodb();

export const TABLES = {
  USER_INGREDIENTS:
    process.env.tableName !== undefined
      ? process.env.tableName
      : 'UserIngredients',
};
