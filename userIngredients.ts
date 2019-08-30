const dynamodb = require("serverless-dynamodb-client");

import {
  DynamoQueryResponse,
  DynamoGetResponse,
  IngredientNameParams,
  Ingredient,
  IngredientTemplate
} from "./types";

export const TABLE_NAME = "UserIngredients";
const dynamoDbClient = dynamodb.doc;

export class UserIngredients {
  userKey: string;

  constructor(userKey: string) {
    this.userKey = userKey;
  }

  getAll(): Promise<DynamoQueryResponse> {
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
    return dynamoDbClient.query(params).promise();
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

  async getItemByName(name: string): Promise<DynamoGetResponse> {
    return await dynamoDbClient
      .get(this.getIngredientNameParams(name))
      .promise();
  }

  async deleteUserIngredientStyle(
    name: string,
    style: string
  ): Promise<DynamoQueryResponse> {
    const ingredient = await this.getItemByName(name);
    console.log(ingredient);
    if (
      Object.keys(ingredient).length === 0 &&
      ingredient.constructor === Object
    ) {
      return ingredient;
    }
    const styles = ingredient.Item.style;
    console.log(ingredient);
    if (styles.length === 0) {
      console.log("deleted item", this.getIngredientNameParams(name));
      return dynamoDbClient
        .delete(this.getIngredientNameParams(name))
        .promise();
    } else {
      const updateParams = {
        UpdateExpression: "set #style = :styles",
        ExpressionAttributeNames: {
          "#style": "style"
        },
        ExpressionAttributeValues: {
          ":styles": styles.filter((s: String) => s !== style)
        },
        ReturnValues: "UPDATED_NEW",
        TableName: TABLE_NAME,
        Key: {
          userId: this.userKey,
          name
        }
      };
      return dynamoDbClient.update(updateParams).promise();
    }
  }

  async createIngredient(ingredient: Ingredient): Promise<DynamoGetResponse> {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: this.userKey,
        ...ingredient
      },
      ReturnValues: "ALL_OLD"
    };
    const res = await dynamoDbClient.put(params).promise();
    console.log(res);
    return new Promise((resolve, reject) => {
      resolve(res["Attributes"]);
      reject({error: "blah"});
    });

  }
}
