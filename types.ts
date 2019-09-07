import { APIGatewayProxyEvent } from 'aws-lambda';

export type Response = {
  statusCode: number;
  body: string;
  headers: object;
};

export type FilteredEvent = {
  body: object | string;
  headers: object;
  httpMethod: string;
  path: string;
};
export type ErrorMessage = {
  property: string;
  message: string;
};

export type GetNewRecipeFunc = (event: FilteredEvent) => Promise<RecipeItem[]>;
export type GetNewRecipe = (event: APIGatewayProxyEvent) => Promise<Response>;

export type IngredientStyleFunc = (
  event: FilteredEvent,
) => Promise<UserIngredient>;

export type GetIngredientsByUserIdFunc = (
  event: FilteredEvent,
) => Promise<Ingredient[]>;

export type IngredientHandler = {
  getNewRecipeEvent: GetNewRecipeFunc;
  getNewRecipe: GetNewRecipe;
};

export type Item = {
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

export type AddIngredientEvent = {
  userKey: string;
  ingredient: UserIngredient;
};

export type DeleteIngredientStyleEvent = BaseIngredientEvent & {
  name: string;
  style: string;
};

export type DeleteIngredientStyle = {
  name: string;
  style: string;
};

export type NewRecipe = {
  dietPreference: DietPreference;
  ignoredIngredients: RecipeItem[];
  numOfOptionalIngredients: number;
  requestedIngredients: RecipeItem[];
};

export type NewRecipeEvent = BaseIngredientEvent & {
  dietPreference: DietPreference;
  ignoredIngredients: RecipeItem[];
  numOfOptionalIngredients: number;
  requestedIngredients: RecipeItem[];
};

export type UserHeaders = {
  'X-User-Key'?: string;
  'x-user-key'?: string;
};

export type DietPreference = 'carnivore' | 'vegan' | 'vegetarian';
