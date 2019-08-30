"use strict";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { Recipe } from "./recipe";
import { UserIngredients } from "./userIngredients";
import { defaultIngredients } from "./config";

import { EventSanitizer } from "./eventSanitizer";
import { validateSchema } from "./schema";
// import { defaultEvent } from './api';

import { Response, RecipeItem } from "./types";

const DEFAULT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

const validate = validateSchema`
  type: object
  properties:
    name:
      type: string
    style:
      type: array
      items:
        type: string
    type:
      type: array
      items:
        type: string
    required:
      type: boolean
  required:
    - name
    - style
`;

export const addIngredient = async (
  event: APIGatewayProxyEvent, _context: Context) => {
  const { ingredient, userKey } = new EventSanitizer(
    event
    ).eventFilterAddIngredient();
  try {
    validate(ingredient);
  } catch(e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e),
      headers: DEFAULT_HEADERS
    }
  }

  const newIngredient = await new UserIngredients(userKey).createIngredient(
    ingredient
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredient: newIngredient
    }),
    headers: DEFAULT_HEADERS
  };
};

//export const addIngredient = defaultEvent(addIngredientEvent);

export const deleteIngredientStyle = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Response> => {
  const { name, style, userKey } = new EventSanitizer(
    event
  ).eventFilterDeleteIngredientStyle();

  const result = await new UserIngredients(userKey).deleteUserIngredientStyle(
    name,
    style
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

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: {}
    }),
    headers: DEFAULT_HEADERS
  };
};

export const getIngredientsByUserId = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  const { userKey } = new EventSanitizer(event).listIngredientsParams();

  const userIngredients = await new UserIngredients(userKey).getAll();

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: userIngredients.Items
    }),
    headers: DEFAULT_HEADERS
  };
};

export const getNewRecipe = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Response> => {
  const {
    userKey,
    numOfOptionalIngredients,
    requestedIngredients,
    ignoredIngredients,
    dietPreference
  } = new EventSanitizer(event).eventFilterNewRecipe();

  const userIngredients = await new UserIngredients(userKey).getAll();

  const recipeItems =
    userIngredients.Items.length === 0
      ? defaultIngredients()
      : userIngredients.Items;

  if (userIngredients.Items.length === 0) {
    await new UserIngredients(userKey).bulkCreateIngredients(
      defaultIngredients()
    );
  }

  const recipe = new Recipe(recipeItems, numOfOptionalIngredients);
  recipe.setDietPreference(dietPreference);
  ignoredIngredients.map((i: RecipeItem) => recipe.ignoreIngredient(i));
  requestedIngredients.map((i: RecipeItem) => recipe.requestIngredient(i));

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: recipe.recipe()
    }),
    headers: DEFAULT_HEADERS
  };
};
