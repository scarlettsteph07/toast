import { APIGatewayProxyEvent, Context } from "aws-lambda";
import * as AWS from "aws-sdk";

import {
  GetNewRecipeFunc,
  FilteredEvent,
  IngredientStyleFunc,
  GetIngredientsByUserIdFunc,
} from "src/types";

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const options = {
  endpoint: "http://localhost:8000",
  region: "localhost",
};

const isOffline = () => {
  if (process.env.hasOwnProperty("IS_OFFLINE")) {
    return process.env.IS_OFFLINE;
  }
  // Depends on serverless-offline plugion which adds IS_OFFLINE to process.env when running offline
  return false;
};

const dynamodb = () =>
  <boolean>isOffline()
    ? new AWS.DynamoDB.DocumentClient(options)
    : new AWS.DynamoDB.DocumentClient();

export const dynamoDbClient = dynamodb();

export const eventWrapper = (
  originalFunction:
    | GetNewRecipeFunc
    | IngredientStyleFunc
    | GetIngredientsByUserIdFunc,
) => async (event: APIGatewayProxyEvent, _context: Context) => {
  try {
    const filteredEvent = <FilteredEvent>event;
    const data = await originalFunction(filteredEvent, dynamoDbClient);

    if (Object.keys(data).length === 0) {
      return {
        body: JSON.stringify({
          error: "Item not found",
        }),
        headers: DEFAULT_HEADERS,
        statusCode: "404",
      };
    }
    return {
      body: JSON.stringify(data),
      headers: DEFAULT_HEADERS,
      statusCode: "200",
    };
  } catch (e) {
    if (e.message === "User Key is required") {
      return {
        body: JSON.stringify({
          message: "please provide user auth header",
        }),
        headers: DEFAULT_HEADERS,
        statusCode: "403",
      };
    }

    return {
      body: JSON.stringify({
        e,
      }),
      headers: DEFAULT_HEADERS,
      statusCode: "400",
    };
  }
};
