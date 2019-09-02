import * as AWS from 'aws-sdk';

import {
  DynamoQueryResponse,
  Ingredient,
  IngredientNameParams,
  IngredientTemplate,
  UserIngredient,
  DynamoResponse,
} from './types';

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
  isOffline()
    ? new AWS.DynamoDB.DocumentClient(options)
    : new AWS.DynamoDB.DocumentClient();

export const TABLE_NAME = 'UserIngredients';
const dynamoDbClient = dynamodb();

export class UserIngredients {
  private readonly userKey: string;

  constructor(userKey: string) {
    this.userKey = userKey;
  }

  public async getAll(): Promise<Ingredient[]> {
    const params = {
      ExpressionAttributeNames: {
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': this.userKey,
      },
      KeyConditionExpression: '#userId = :userId',
      TableName: TABLE_NAME,
    };
    const dynamoResponse = await dynamoDbClient.query(params).promise();

    return new Promise((resolve, reject) => {
      if (!dynamoResponse.hasOwnProperty('Items')) {
        reject({ error: 'no results returned' });
      }
      resolve(
        dynamoResponse['Items'].map(
          (item: Ingredient): Ingredient => {
            return {
              name: item.name,
              style: item.style,
              type: item.type,
              required: item.required,
            };
          },
        ),
      );
    });
  }

  getIngredientNameParams(name: string): IngredientNameParams {
    return {
      TableName: TABLE_NAME,
      Key: {
        userId: this.userKey,
        name,
      },
    };
  }

  async bulkCreateIngredients(
    recipeItems: Array<IngredientTemplate>,
  ): Promise<DynamoQueryResponse> {
    const params = {
      RequestItems: {
        [TABLE_NAME]: recipeItems.map((i: IngredientTemplate) => {
          return {
            PutRequest: {
              Item: {
                name: i.name,
                style: i.style,
                type: i.type,
                required: i.required,
                userId: this.userKey,
              },
            },
          };
        }),
      },
    };
    return await dynamoDbClient.batchWrite(params).promise();
  }

  public async getItemByName(name: string): Promise<DynamoResponse> {
    // TODO: fix this because its probably broken
    return await dynamoDbClient
      .get(this.getIngredientNameParams(name))
      .promise();
  }

  public async deleteByStyle(name: string, style: string): Promise<UserIngredient> {
    const ingredient = await this.getItemByName(name);
    if (
      Object.keys(ingredient).length === 0 &&
      ingredient.constructor === Object
    ) {
      return new Promise((resolve, reject) => {
        resolve(Object.assign({ userKey: this.userKey }, ingredient['Item']));
        reject({ error: 'no results returned' });
      });
    }
    const styles = ingredient.Item.style;
    if (styles.length === 0) {
      return dynamoDbClient
        .delete(this.getIngredientNameParams(name))
        .promise();
    }

    const updateParams = {
      ExpressionAttributeNames: {
        '#style': 'style',
      },
      ExpressionAttributeValues: {
        ':styles': styles.filter((s: string) => s !== style),
      },
      Key: {
        userId: this.userKey,
      },
      ReturnValues: 'ALL_NEW',
      TableName: TABLE_NAME,
      UpdateExpression: 'set #style = :styles',
      name,
    };

    const res = await dynamoDbClient.update(updateParams).promise();

    return new Promise((resolve, reject) => {
      resolve(res['Attributes']);
      reject({ error: 'error updating from dynamo' });
    });
  }

  public async createIngredient(
    ingredient: Ingredient,
  ): Promise<UserIngredient> {
    const params = {
      Item: {
        ...ingredient,
        userId: this.userKey,
      },
      ReturnValues: 'ALL_OLD',
      TableName: TABLE_NAME,
    };
    const res = await dynamoDbClient.put(params).promise();

    return new Promise((resolve, reject) => {
      resolve(res['Attributes']);
      reject({ error: 'blah' });
    });
  }
}
