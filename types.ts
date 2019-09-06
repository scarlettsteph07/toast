import { APIGatewayProxyEvent } from 'aws-lambda';

export type Response = {
  statusCode: number;
  body: string;
  headers: object;
};

export type FilteredEvent = {
  body: string;
  headers: object;
  httpMethod: string;
  path: string;
};

export type GetNewRecipeFunc = (event: FilteredEvent) => Promise<RecipeItem[]>;
export type GetNewRecipe = (event: APIGatewayProxyEvent) => Promise<Response>;

export type IngredientHandler = {
  getNewRecipeEvent: GetNewRecipeFunc;
  getNewRecipe: GetNewRecipe;
};

type Item = {
  name: string;
  style: string[];
  type: string[];
  userId: string;
  required: boolean;
};

export type Ingredient = {
  name: string;
  style: string[];
  type: string[];
  required: boolean;
};

export type RecipeItem = {
  name: string;
  style: string;
  required?: boolean;
};

export type UserIngredient = BaseIngredientEvent & Ingredient;

export type DynamoQueryResponse = {
  Items: Item[];
  Count: number;
  ScannedCount: number;
};

export type DynamoResponse = {
  Item: Item;
};

export type IngredientNameParams = {
  TableName: string;
  Key: {
    userId: string;
    name: string;
  };
};

export type BaseIngredientEvent = {
  userKey: string;
};

export type AddIngredientEvent = BaseIngredientEvent & {
  ingredient: UserIngredient;
};

export type DeleteIngredientStyleEvent = BaseIngredientEvent & {
  name: string;
  style: string;
};

export type NewRecipeEvent = BaseIngredientEvent & {
  dietPreference: DietPreference;
  ignoredIngredients: RecipeItem[];
  numOfOptionalIngredients: number;
  requestedIngredients: RecipeItem[];
};

export type DietPreference = 'carnivore' | 'vegan' | 'vegetarian';
