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
  const body =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  console.log(body);

  let { dietPreference, numOfOptionalIngredients } = body
    ? body
    : defaultPreferences;

  const ingredients = getIngredientsHelper({
    dietPreference,
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
