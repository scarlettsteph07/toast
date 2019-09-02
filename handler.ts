'use strict';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import { Recipe } from './recipe';
import { defaultIngredients } from './config';
import { EventSanitizer } from './eventSanitizer';
import { RequestValidator } from './schema';
import { eventWrapper } from './utils';
import { RecipeItem, UserIngredient, Ingredient } from './types';
import { UserIngredients } from './userIngredients';

const addIngredientEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<UserIngredient> => {
  const { ingredient, userKey } = new EventSanitizer(
    event,
  ).eventFilterAddIngredient();
  new RequestValidator(ingredient).validateAddIngredient();
  return new UserIngredients(userKey).createIngredient(ingredient);
};

export const addIngredient = eventWrapper(addIngredientEvent);

const deleteIngredientStyleEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<UserIngredient> => {
  const { name, style, userKey } = new EventSanitizer(
    event,
  ).eventFilterDeleteIngredientStyle();
  new RequestValidator({ name, style }).validateDeleteIngredientStyle();

  return new UserIngredients(userKey).deleteByStyle(name, style);
};

export const deleteIngredientStyle = eventWrapper(deleteIngredientStyleEvent);

const getIngredientsByUserIdEvent = async (
  event: APIGatewayProxyEvent,
): Promise<Ingredient[]> => {
  const { userKey } = new EventSanitizer(event).listIngredientsParams();

  return new UserIngredients(userKey).getAll();
};

export const getIngredientsByUserId = eventWrapper(getIngredientsByUserIdEvent);

export const getNewRecipeEvent = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<RecipeItem[]> => {
  const {
    userKey,
    numOfOptionalIngredients,
    requestedIngredients,
    ignoredIngredients,
    dietPreference,
  } = new EventSanitizer(event).eventFilterNewRecipe();

  new RequestValidator({
    ignoredIngredients,
    numOfOptionalIngredients,
    requestedIngredients,
  }).validateGetNewRecipeParams();

  let userIngredients: Ingredient[];

  try {
    userIngredients = await new UserIngredients(userKey).getAll();
  } catch (error) {
    userIngredients = [];
  }
  const recipeItems =
    userIngredients.length === 0 ? defaultIngredients() : userIngredients;

  const invalidStyles: RecipeItem[] = [];
  const invalidIngredients: RecipeItem[] = [];

  ignoredIngredients.map((i: RecipeItem) => {
    const ingredient: Ingredient = recipeItems.find(
      (r: Ingredient): boolean =>  r.name === i.name,
    );
    if (!ingredient) {
      invalidIngredients.push(i);
    } else {
      if (!ingredient.style.includes(i.style)) {
        invalidStyles.push({
          name: i.name,
          style: i.style,
        });
      }
    }
  });

  if (invalidIngredients.length > 0) {
    throw new Error(
      `Invalid name for [${invalidIngredients.map(i => i.name)}]`,
    );
  }

  if (invalidStyles.length > 0) {
    throw new Error(`Invalid style for [${invalidStyles.map(i => i.style)}]`);
  }

  if (userIngredients.length === 0) {
    await new UserIngredients(userKey).bulkCreateIngredients(
      defaultIngredients(),
    );
  }
  const recipe = new Recipe(recipeItems, numOfOptionalIngredients);
  recipe.setDietPreference(dietPreference);
  ignoredIngredients.map((i: RecipeItem) => recipe.ignoreIngredient(i));
  requestedIngredients.map((i: RecipeItem) => recipe.requestIngredient(i));

  return new Promise((resolve, reject) => {
    resolve(recipe.recipe());
    reject({ error: 'error generating new recipe' });
  });
};

export const getNewRecipe = eventWrapper(getNewRecipeEvent);
