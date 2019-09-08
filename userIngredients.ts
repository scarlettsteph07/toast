import * as AWS from 'aws-sdk';

import { TABLES } from './dynamodb';

import {
  Ingredient,
  IngredientNameParams,
  UserIngredient,
  Item,
} from './types';

export class UserIngredients {
  private readonly userKey: string;
  private readonly dynamoDbClient: AWS.DynamoDB.DocumentClient;

  constructor(userKey: string, dynamoDbClient: AWS.DynamoDB.DocumentClient) {
    this.userKey = userKey;
    this.dynamoDbClient = dynamoDbClient;
    return this;
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
      TableName: TABLES.USER_INGREDIENTS,
    };
    const dynamoResponse = await this.dynamoDbClient.query(params).promise();
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
        [TABLES.USER_INGREDIENTS]: recipeItems.map((i: Ingredient) => ({
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
    const result = await this.dynamoDbClient.batchWrite(params).promise();
    return new Promise((resolve, reject) => {
      if (result !== undefined) {
        resolve(true);
      }
      reject('no items found');
    });
  }

  public async getItemByName(name: string): Promise<Item> {
    const ingredient = await this.dynamoDbClient
      .get(this.getIngredientNameParams(name))
      .promise();

    return new Promise((resolve, reject) => {
      if (ingredient !== undefined) {
        resolve(ingredient.Item as Item);
      }
      reject('no items found');
    });
  }

  public async deleteByStyle(
    name: string,
    style: string,
  ): Promise<UserIngredient> {
    const ingredient = await this.getItemByName(name);

    if (Object.keys(ingredient).length === 0) {
      return new Promise((resolve, reject) => {
        resolve({ userKey: this.userKey, ...ingredient });
        reject({ error: 'no results returned' });
      });
    }

    const styles = ingredient.style;
    if (styles.length === 0) {
      const deleteResult = await this.dynamoDbClient
        .delete(this.getIngredientNameParams(name))
        .promise();

      return new Promise((resolve, reject) => {
        resolve(deleteResult.Attributes as UserIngredient);
        reject('error deleting item');
      });
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
      TableName: TABLES.USER_INGREDIENTS,
      UpdateExpression: 'set #style = :styles',
      name,
    };

    const updateResult = await this.dynamoDbClient
      .update(updateParams)
      .promise();

    return new Promise((resolve, reject) => {
      resolve(updateResult.Attributes as UserIngredient);
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
      TableName: TABLES.USER_INGREDIENTS,
    };
    const res = await this.dynamoDbClient.put(params).promise();

    return new Promise((resolve, reject) => {
      resolve(res.Attributes as UserIngredient);
      reject({ error: 'blah' });
    });
  }

  private getIngredientNameParams(name: string): IngredientNameParams {
    return {
      Key: {
        name,
        userId: this.userKey,
      },
      TableName: TABLES.USER_INGREDIENTS,
    };
  }
}
