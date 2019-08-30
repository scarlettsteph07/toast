"use strict";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { Recipe, RecipeItem } from "./recipe";
import { UserIngredients } from "./userIngredients"
import { ingredients } from "./config";
import { getEventData, getUserKey } from "./handlerHelperMethods";
import { Ingredient, Response } from "./types";

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

export const addIngredient = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Response> => {
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  const headers =
    typeof event.headers === "string"
      ? JSON.parse(event.headers)
      : event.headers;
  const userKey = headers["X-User-Key"] || headers["x-user-key"] || 'demo';

  const newIngredient = await new UserIngredients(userKey).createIngredient(body);
  console.log(body, headers);
  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredient: newIngredient
    }),
    headers: DEFAULT_HEADERS
  };
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

  const userKey = headers["X-User-Key"] || headers["x-user-key"] || "demo";
  const result = await new UserIngredients(userKey).deleteUserIngredientStyle(
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


export const getIngredientsByUserId = async (
  event: APIGatewayProxyEvent,
): Promise<Response> => {
  const headers = getEventData(event.headers);
  const userKey = getUserKey(headers);
  const userIngredients = await new UserIngredients(userKey).getAll()
  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: userIngredients.Items
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

    const userKey = headers["X-User-Key"] || headers["x-user-key"] || "demo";
  const userRows = await new UserIngredients(userKey).getAll()
  console.log('userRows', userRows);

  const recipeItems =
    userRows.Items.length === 0 ? ingredients() : userRows.Items;

  if (userRows.Items.length === 0) {
    const ingredientsData: Array<Ingredient> = ingredients();

    for (let i: number = 0; i <= ingredientsData.length - 1; i++) {
      await new UserIngredients(userKey).createIngredient(ingredientsData[i]);
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

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: recipe.recipe()
    }),
    headers: DEFAULT_HEADERS
  };
};
