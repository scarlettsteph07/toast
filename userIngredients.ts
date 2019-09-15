import * as AWS from "aws-sdk";

import { TABLES } from "dynamodb";
import { Ingredient, IngredientNameParams, UserIngredient, Item } from "types";

export class UserIngredients {
  private readonly dynamoDbClient: AWS.DynamoDB.DocumentClient;
  private readonly userKey: string;

  constructor(userKey: string, dynamoDbClient: AWS.DynamoDB.DocumentClient) {
    this.userKey = userKey;
    this.dynamoDbClient = dynamoDbClient;
    return this;
  }

  public async getAll(): Promise<Ingredient[]> {
    const params = {
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": this.userKey,
      },
      KeyConditionExpression: "#userId = :userId",
      TableName: TABLES.USER_INGREDIENTS,
    };
    const dynamoResponse = await this.dynamoDbClient.query(params).promise();
    return new Promise((resolve, reject) => {
      if (dynamoResponse.Items !== undefined) {
        resolve(
          dynamoResponse.Items.map(
            (item: any): Ingredient => {
              if (item !== undefined) {
                return {
                  name: <string>item.name,
                  required: <boolean>item.required,
                  style: <[]>item.style,
                  type: <[]>item.type,
                };
              }

              return {
                name: "",
                required: false,
                style: [],
                type: [],
              };
            },
          ).filter((i: Ingredient) => i.name !== ""),
        );
      }
      reject({ error: "no results returned" });
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
      reject("no items found");
    });
  }

  public async getItemByName(name: string): Promise<Item> {
    const ingredient = await this.dynamoDbClient
      .get(this.getIngredientNameParams(name))
      .promise();
    return new Promise((resolve, reject) => {
      if (
        ingredient !== undefined &&
        ingredient.Item !== undefined &&
        ingredient.Item.name === name
      ) {
        resolve(<Item>ingredient.Item);
      }
      reject("no items found");
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
        reject({ error: "no results returned" });
      });
    }

    const styles = ingredient.style;
    if (styles.length === 1 && styles[0] === style) {
      const deleteResult = await this.dynamoDbClient
        .delete(this.getIngredientNameParams(name))
        .promise();

      return new Promise((resolve, reject) => {
        resolve(<UserIngredient>deleteResult.Attributes);
        reject("error deleting item");
      });
    }

    const updateParams = {
      ...this.getIngredientNameParams(name),
      ExpressionAttributeNames: {
        "#style": "style",
      },
      ExpressionAttributeValues: {
        ":styles": styles.filter((s: string) => s !== style),
      },
      ReturnValues: "ALL_NEW",
      UpdateExpression: "set #style = :styles",
      name,
    };

    const updateResult = await this.dynamoDbClient
      .update(updateParams)
      .promise();

    return new Promise((resolve, reject) => {
      resolve(<UserIngredient>updateResult.Attributes);
      reject({ error: "error updating from dynamo" });
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
      ReturnValues: "ALL_OLD",
      TableName: TABLES.USER_INGREDIENTS,
    };
    const res = await this.dynamoDbClient.put(params).promise();

    return new Promise((resolve, reject) => {
      resolve(<UserIngredient>res.Attributes);
      reject({ error: "blah" });
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
