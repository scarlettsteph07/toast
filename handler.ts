"use strict";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
const dynamodb = require("serverless-dynamodb-client");

import { Recipe, RecipeItem } from "./recipe";
import { ingredients } from "./config";
import { DynamoResponse, Ingredient, Response } from "./types";

const dynamoDbClient = dynamodb.doc;

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

const TABLE_NAME = "UserIngredients";

const getUserIngredientsFromDynamo = async (
  userKey: String
): Promise<DynamoResponse> => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId"
    },
    ExpressionAttributeValues: {
      ":userId": userKey
    }
  };
  return dynamoDbClient.query(params).promise();
};

const deleteUserIngredientStyle = async (
  userKey: String,
  name: String,
  style: String
): Promise<DynamoResponse> => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userKey,
      name
    }
  };
  const ingredient = await dynamoDbClient.get(params).promise();
  console.log(ingredient);
  if (
    Object.keys(ingredient).length === 0 &&
    ingredient.constructor === Object
  ) {
    return ingredient;
  }
  const styles = ingredient.Item.style;
  if (styles.length === 0) {
    console.log("deleted item", params);
    return dynamoDbClient.delete(params).promise();
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
      ...params
    };
    return dynamoDbClient.update(updateParams).promise();
  }
};

const createIngredient = async (userKey: String, ingredient: Ingredient) => {
  const params = {
    TableName: "UserIngredients",
    Item: {
      userId: userKey,
      ...ingredient
    }
  };
  return dynamoDbClient.put(params).promise();
};

export const removeIngredient = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Response> => {
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  const headers =
    typeof event.headers === "string"
      ? JSON.parse(event.headers)
      : event.headers;

  console.log("Request Headers:", headers);
  console.log("Request Body", body);

  const userKey = headers["X-User-Key"];
  const result = await deleteUserIngredientStyle(
    userKey,
    body.name,
    body.style
  );
  if (Object.keys(result).length === 0 && result.constructor === Object) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Item not found"
      }),
      headers: DEFAULT_HEADERS
    };
  }
  console.log("result:", result);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: {}
    }),
    headers: DEFAULT_HEADERS
  };
};

export const getIngredients = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Response> => {
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  const headers =
    typeof event.headers === "string"
      ? JSON.parse(event.headers)
      : event.headers;

  console.log("Request Headers:", headers);
  console.log("Request Body", body);

  const userKey = headers["X-User-Key"];
  const userRows = await getUserIngredientsFromDynamo(userKey);

  const recipeItems =
    userRows.Items.length === 0 ? ingredients() : userRows.Items;

  if (userRows.Items.length === 0) {
    const ingredientsData: Array<Ingredient> = ingredients();

    for (let i: number = 0; i <= ingredientsData.length - 1; i++) {
      await createIngredient(userKey, ingredientsData[i]);
    }
  }

  const recipe = new Recipe(recipeItems, body.numOfOptionalIngredients);
  recipe.setDietPreference(body.dietPreference);

  if (body.ignoredIngredients && body.ignoredIngredients.length > 0) {
    body.ignoredIngredients.forEach((i: RecipeItem) =>
      recipe.ignoreIngredient(i)
    );
  }

  if (body.requestedIngredients && body.requestedIngredients.length > 0) {
    body.requestedIngredients.forEach((i: RecipeItem) =>
      recipe.requestIngredient(i)
    );
  }

  recipe.calculateRequiredIngredients();
  recipe.calculateOptionalIngredients();

  var params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userKey,
      name: "avocado"
    }
  };

  const data = await dynamoDbClient.get(params).promise();
  console.log(data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: recipe.recipe()
    }),
    headers: DEFAULT_HEADERS
  };
};
