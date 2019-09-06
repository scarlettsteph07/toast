import * as AWS from 'aws-sdk';

import {
  DynamoQueryResponse,
  Ingredient,
  IngredientNameParams,
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
      if (dynamoResponse.Items !== undefined) {
        resolve(
          dynamoResponse.Items.map(
            (item): Ingredient => {
              if (item !== undefined) {
                return {
                  name: item.name as string,
                  required: item.required as boolean,
                  style: item.style as [],
                  type: item.type as [],
                };
              }
              return {
                name: '',
                required: false,
                style: [],
                type: [],
              };
            },
          ).filter((i) => i.name !== ''),
        );
      }
      reject({ error: 'no results returned' });
    });
  }

  public async bulkCreateIngredients(
    recipeItems: Ingredient[],
  ): Promise<boolean> {
    const params = {
      RequestItems: {
        [TABLE_NAME]: recipeItems.map((i: Ingredient) => ({
          PutRequest: {
            Item: {
              name: i.name,
              required: i.required,
              style: i.style,
              type: i.type,
              userId: this.userKey,
            },
          },
        })),
      },
    };
    try {
      await dynamoDbClient.batchWrite(params).promise();
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  public async getItemByName(name: string): Promise<DynamoResponse> {
    // TODO: fix this because its probably broken
    return await dynamoDbClient
      .get(this.getIngredientNameParams(name))
      .promise();
  }

  public async deleteByStyle(
    name: string,
    style: string,
  ): Promise<UserIngredient> {
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

  private getIngredientNameParams(name: string): IngredientNameParams {
    return {
      Key: {
        name,
        userId: this.userKey,
      },
      TableName: TABLE_NAME,
    };
  }
}
