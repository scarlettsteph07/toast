export interface Response {
  statusCode: number;
  body: string;
  headers: object;
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

export type UserIngredient = 
  BaseIngredientEvent & Ingredient;

export type DynamoQueryResponse = {
  Items: Array<Item>;
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
  numOfOptionalIngredients: number;
  ignoredIngredients: Array<RecipeItem>;
  requestedIngredients: Array<RecipeItem>;
  dietPreference: DietPreference;
};

export type IngredientTemplate = {
  name: string;
  style: string[];
  type: string[];
  required: boolean;
};

export type DietPreference = "carnivore" | "vegan" | "vegetarian";
