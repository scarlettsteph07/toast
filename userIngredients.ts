const dynamodb = require("serverless-dynamodb-client");

import {
  DynamoQueryResponse,
  IngredientNameParams,
  Ingredient,
  IngredientTemplate,
  UserIngredient
} from "./types";

export const TABLE_NAME = "UserIngredients";
const dynamoDbClient = dynamodb.doc;

export class UserIngredients {
  userKey: string;

  constructor(userKey: string) {
    this.userKey = userKey;
  }

  async getAll(): Promise<any> {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": this.userKey
      }
    };
    const dynamoResponse = await dynamoDbClient.query(params).promise();

    return new Promise((resolve, reject) => {
      resolve(
        dynamoResponse["Items"].map((item: any) => {
          return {
            name: item.name,
            style: item.style,
            type: item.type,
            required: item.required
          };
        })
      );
      reject({ error: "no results returned" });
    });
  }

  getIngredientNameParams(name: string): IngredientNameParams {
    return {
      TableName: TABLE_NAME,
      Key: {
        userId: this.userKey,
        name
      }
    };
  }

  async bulkCreateIngredients(
    recipeItems: Array<IngredientTemplate>
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
                userId: this.userKey
              }
            }
          };
        })
      }
    };
    return await dynamoDbClient.batchWrite(params).promise();
  }

  async getItemByName(name: string): Promise<UserIngredient> {
    // TODO: fix this because its probably broken
    return await dynamoDbClient
      .get(this.getIngredientNameParams(name))
      .promise();
  }

  async deleteByStyle(name: string, style: string): Promise<UserIngredient> {
    const ingredient = await this.getItemByName(name);
    if (
      Object.keys(ingredient).length === 0 &&
      ingredient.constructor === Object
    ) {
      return new Promise((resolve, reject) => {
        resolve(ingredient);
        reject({ error: "no results returned" });
      });
    }
    const styles = ingredient.Item.style;
    if (styles.length === 0) {
      return dynamoDbClient
        .delete(this.getIngredientNameParams(name))
        .promise();
    }

    const updateParams = {
      UpdateExpression: "set #style = :styles",
      ExpressionAttributeNames: {
        "#style": "style"
      },
      ExpressionAttributeValues: {
        ":styles": styles.filter((s: String) => s !== style)
      },
      ReturnValues: "ALL_NEW",
      TableName: TABLE_NAME,
      Key: {
        userId: this.userKey,
        name
      }
    };

    const res = await dynamoDbClient.update(updateParams).promise();

    return new Promise((resolve, reject) => {
      resolve(res["Attributes"]);
      reject({ error: "error updating from dynamo" });
    });
  }

  async createIngredient(ingredient: Ingredient): Promise<UserIngredient> {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: this.userKey,
        ...ingredient
      },
      ReturnValues: "ALL_OLD"
    };
    const res = await dynamoDbClient.put(params).promise();

    return new Promise((resolve, reject) => {
      resolve(res["Attributes"]);
      reject({ error: "blah" });
    });
  }
}
