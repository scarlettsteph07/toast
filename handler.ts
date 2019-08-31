"use strict";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { Recipe } from "./recipe";
import { UserIngredients } from "./userIngredients";
import { defaultIngredients } from "./config";

import { EventSanitizer } from "./eventSanitizer";
import { RequestValidator } from "./schema";
import { eventWrapper } from "./utils";

import { RecipeItem } from "./types";

const addIngredientEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<any> => {
  const { ingredient, userKey } = new EventSanitizer(
    event
  ).eventFilterAddIngredient();
  new RequestValidator(ingredient).validateAddIngredient();

  return await new UserIngredients(userKey).createIngredient(ingredient);
};

export const addIngredient = eventWrapper(addIngredientEvent);

const deleteIngredientStyleEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<any> => {
  const { name, style, userKey } = new EventSanitizer(
    event
  ).eventFilterDeleteIngredientStyle();
  new RequestValidator({ name, style }).validateDeleteIngredientStyle();

  return await new UserIngredients(userKey).deleteUserIngredientStyle(
    name,
    style
  );
};

export const deleteIngredientStyle = eventWrapper(deleteIngredientStyleEvent);

const getIngredientsByUserIdEvent = async (
  event: APIGatewayProxyEvent
): Promise<any> => {
  const { userKey } = new EventSanitizer(event).listIngredientsParams();
  return await new UserIngredients(userKey).getAll();
};

export const getIngredientsByUserId = eventWrapper(getIngredientsByUserIdEvent);

export const getNewRecipeEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<any> => {
  const {
    userKey,
    numOfOptionalIngredients,
    requestedIngredients,
    ignoredIngredients,
    dietPreference
  } = new EventSanitizer(event).eventFilterNewRecipe();

  new RequestValidator({
    numOfOptionalIngredients,
    requestedIngredients,
    ignoredIngredients
  }).validateGetNewRecipeParams();

  const userIngredients = await new UserIngredients(userKey).getAll();

  const recipeItems =
    userIngredients.length === 0 ? defaultIngredients() : userIngredients;

  const invalidStyles = [];
  const invalidIngredients = [];

  ignoredIngredients.map((i: any) => {
    const ingredient = recipeItems.find((r: any) => r.name === i.name);
    if (!ingredient) {
      invalidIngredients.push(i);
    } else {
      if (!ingredient.style.includes(i.style)) {
        console.log(i);
        invalidStyles.push({
          name: i.name,
          style: i.style
        });
      }
    }
  });

  if (invalidIngredients.length > 0) {
    throw new Error(
      `Invalid name for [${invalidIngredients.map(i => i.name)}]`
    );
  }

  if (invalidStyles.length > 0) {
    throw new Error(`Invalid style for [${invalidStyles.map(i => i.style)}]`);
  }

  if (userIngredients.length === 0) {
    await new UserIngredients(userKey).bulkCreateIngredients(
      defaultIngredients()
    );
  }

  const recipe = new Recipe(recipeItems, numOfOptionalIngredients);
  recipe.setDietPreference(dietPreference);
  ignoredIngredients.map((i: RecipeItem) => recipe.ignoreIngredient(i));
  requestedIngredients.map((i: RecipeItem) => recipe.requestIngredient(i));

  return await new Promise((resolve, reject) => {
    resolve(recipe.recipe());
    reject({ error: "error generating new recipe" });
  });
};

export const getNewRecipe = eventWrapper(getNewRecipeEvent);
