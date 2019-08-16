"use strict";

import { getIngredientsHelper } from "./helperMethods";
import { defaultPreferences } from "./config.json";

import { APIGatewayProxyEvent, Context } from "aws-lambda";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

export const getIngredients = async (
  event: APIGatewayProxyEvent,
  _context: Context
) => {
  let { isCarnivore, numOfOptionalIngredients } = event.body
    ? JSON.parse(event.body)
    : defaultPreferences;

  const ingredients = getIngredientsHelper({
    isCarnivore,
    numOfOptionalIngredients
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients
    }),
    headers
  };
};
