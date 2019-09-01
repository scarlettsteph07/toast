"use strict";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

import { Recipe } from "./recipe";
// import { UserIngredients } from "./userIngredients";
import { defaultIngredients } from "./config";

import { EventSanitizer } from "./eventSanitizer";
import { RequestValidator } from "./schema";
import { eventWrapper } from "./utils";

import { RecipeItem, UserIngredient, Ingredient } from "./types";

const addIngredientEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<UserIngredient> => {
  const { ingredient, userKey } = new EventSanitizer(
    event
  ).eventFilterAddIngredient();
  new RequestValidator(ingredient).validateAddIngredient();
  const { UserIngredients } = require("./userIngredients");
  return await new UserIngredients(userKey).createIngredient(ingredient);
};

export const addIngredient = eventWrapper(addIngredientEvent);

const deleteIngredientStyleEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<UserIngredient> => {
  const { name, style, userKey } = new EventSanitizer(
    event
  ).eventFilterDeleteIngredientStyle();
  new RequestValidator({ name, style }).validateDeleteIngredientStyle();
  const { UserIngredients } = require("./userIngredients");
  return await new UserIngredients(userKey).deleteByStyle(name, style);
};

export const deleteIngredientStyle = eventWrapper(deleteIngredientStyleEvent);

const getIngredientsByUserIdEvent = async (
  event: APIGatewayProxyEvent
): Promise<Array<Ingredient>> => {
  const { userKey } = new EventSanitizer(event).listIngredientsParams();
  const { UserIngredients } = require("./userIngredients");
  return await new UserIngredients(userKey).getAll();
};

export const getIngredientsByUserId = eventWrapper(getIngredientsByUserIdEvent);

export const getNewRecipeEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<Array<RecipeItem>> => {
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

  const { UserIngredients } = require("./userIngredients");

  const userIngredients = await new UserIngredients(userKey).getAll();

  const recipeItems =
    userIngredients.length === 0 ? defaultIngredients() : userIngredients;

  const invalidStyles: Array<RecipeItem> = [];
  const invalidIngredients: Array<RecipeItem> = [];

  ignoredIngredients.map((i: RecipeItem) => {
    const ingredient: Ingredient | undefined = recipeItems.find(
      (r: Ingredient): boolean => {
        return r.name === i.name;
      }
    );
    if (!ingredient) {
      invalidIngredients.push(i);
    } else {
      if (!ingredient.style.includes(i.style)) {
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
  console.log("numOfOptionalIngredients:", numOfOptionalIngredients);
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
