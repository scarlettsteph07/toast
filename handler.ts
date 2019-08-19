"use strict";
import { Recipe, RecipeItem } from "./recipe";

import { APIGatewayProxyEvent, Context } from "aws-lambda";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

type Response = {
  statusCode: Number;
  body: String;
  headers: Object;
};

export const getIngredients = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Response> => {
  console.log(event.body);
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  const {
    ignoredIngredients,
    requestedIngredients,
    dietPreference,
    numOfOptionalIngredients
  } = body;

  const recipe = new Recipe(numOfOptionalIngredients, dietPreference);
  if (ignoredIngredients) {
    ignoredIngredients.forEach((i: RecipeItem)  => recipe.ignoreIngredient(i));
  }

  if (requestedIngredients) {
    requestedIngredients.forEach((i: RecipeItem) => recipe.requestIngredient(i));
  }

  recipe.calculateRequiredIngredients();
  recipe.calculateOptionalIngredients();

  console.log(recipe.recipe());

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: recipe.recipe()
    }),
    headers
  };
};
