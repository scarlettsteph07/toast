import { DynamoDB } from "aws-sdk";

import { Recipe } from "src/services/recipe";
import { config } from "src/utils/config";
import { EventSanitizer } from "src/utils/eventSanitizer";
import { RequestValidator } from "src/utils/schema";
import { eventWrapper } from "src/utils/eventWrapper";
import { UserIngredients } from "src/models/userIngredients";

import {
  RecipeItem,
  UserIngredient,
  Ingredient,
  FilteredEvent,
  NewRecipeEvent,
  RecipeIngredients,
} from "src/types";

export const addIngredientEvent = async (
  event: FilteredEvent,
  dynamoDbClient: DynamoDB.DocumentClient,
): Promise<UserIngredient> => {
  const { ingredient, userKey } = new EventSanitizer(
    event,
  ).eventFilterAddIngredient();
  new RequestValidator(ingredient).validateAddIngredient();

  return new UserIngredients(userKey, dynamoDbClient).createIngredient(
    ingredient,
  );
};

export const addIngredient = eventWrapper(addIngredientEvent);

const deleteIngredientStyleEvent = async (
  event: FilteredEvent,
  dynamoDbClient: DynamoDB.DocumentClient,
): Promise<UserIngredient> => {
  const { name, style, userKey } = new EventSanitizer(
    event,
  ).eventFilterDeleteIngredientStyle();
  new RequestValidator({ name, style }).validateDeleteIngredientStyle();

  return new UserIngredients(userKey, dynamoDbClient).deleteByStyle(
    name,
    style,
  );
};

export const deleteIngredientStyle = eventWrapper(deleteIngredientStyleEvent);

const getIngredientsByUserIdEvent = async (
  event: FilteredEvent,
  dynamoDbClient: DynamoDB.DocumentClient,
): Promise<Ingredient[]> => {
  const { userKey } = new EventSanitizer(event).listIngredientsParams();

  return new UserIngredients(userKey, dynamoDbClient).getAll();
};

export const getIngredientsByUserId = eventWrapper(getIngredientsByUserIdEvent);

export const getNewRecipeEvent = async (
  event: FilteredEvent,
  dynamoDbClient: DynamoDB.DocumentClient,
): Promise<RecipeIngredients> => {
  const {
    userKey,
    numOfOptionalIngredients,
    requestedIngredients,
    ignoredIngredients,
    dietPreference,
  }: NewRecipeEvent = new EventSanitizer(event).eventFilterNewRecipe();

  new RequestValidator({
    ignoredIngredients,
    numOfOptionalIngredients,
    requestedIngredients,
  }).validateGetNewRecipeParams();

  let userIngredients: Ingredient[];

  try {
    userIngredients = await new UserIngredients(
      userKey,
      dynamoDbClient,
    ).getAll();
  } catch (error) {
    userIngredients = [];
  }
  const recipeItems = userIngredients.length === 0 ? config() : userIngredients;

  const invalidStyles: RecipeItem[] = [];
  const invalidIngredients: RecipeItem[] = [];

  ignoredIngredients.map((i: RecipeItem) => {
    const ingredient: Ingredient | undefined = recipeItems.find(
      (r: Ingredient): boolean => r.name === i.name,
    );

    if (ingredient === undefined) {
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

  if (!invalidIngredients === undefined) {
    const invalidateIngredientString: string[] = invalidIngredients.map(
      (i: RecipeItem) => i.name,
    );
    throw new Error(
      `Invalid name for [${invalidateIngredientString.toString()}]`,
    );
  }

  if (invalidStyles.length > 0) {
    const invalidStylesString: string[] = invalidStyles.map(
      (i: RecipeItem) => i.style,
    );
    throw new Error(`Invalid style for [${invalidStylesString.toString()}]`);
  }

  if (userIngredients.length === 0) {
    await new UserIngredients(userKey, dynamoDbClient).bulkCreateIngredients(
      config(),
    );
  }
  const recipe = new Recipe(recipeItems, numOfOptionalIngredients);
  recipe.setDietPreference(dietPreference);
  ignoredIngredients.map((i: RecipeItem) => recipe.ignoreIngredient(i));
  requestedIngredients.map((i: RecipeItem) => recipe.requestIngredient(i));

  return new Promise((resolve, reject) => {
    resolve({ ingredients: recipe.recipe() });
    reject({ error: "error generating new recipe" });
  });
};

export const getNewRecipe = eventWrapper(getNewRecipeEvent);
