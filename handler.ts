"use strict";

import { getIngredientsHelper } from "./helperMethods";
import { defaultPreferences } from "./config.json";

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

  const { ignoredIngredients, requestedIngredients } = body;

  let { dietPreference, numOfOptionalIngredients } = body
    ? body
    : defaultPreferences;

  dietPreference = dietPreference ? dietPreference : "carnivore";

  const ingredients = getIngredientsHelper({
    dietPreference,
    numOfOptionalIngredients,
    ignoredIngredients,
    requestedIngredients
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients
    }),
    headers
  };
};
