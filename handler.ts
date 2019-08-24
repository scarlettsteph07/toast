"use strict";
import { Recipe, RecipeItem } from "./recipe";

import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { ingredients } from "./config";

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
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  
  console.log("Request Headers:", event.headers);
  console.log("Request Body", event.body);

  const recipe = new Recipe(ingredients(), body.numOfOptionalIngredients);
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

  console.log(recipe.recipe());

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: recipe.recipe()
    }),
    headers
  };
};
