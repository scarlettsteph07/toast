export type Response = {
  statusCode: Number;
  body: String;
  headers: Object;
};

export type Item = {
  name: string;
  style: Array<string>;
  type: Array<string>;
  userId: string;
  required: Boolean;
};

export type Ingredient = {
  name: string;
  style: Array<string>;
  type: Array<string>;
  required: Boolean;
};

export type UserIngredient = 
  BaseIngredientEvent & Ingredient;

export type DynamoQueryResponse = {
  Items: Array<Item>;
  Count: number;
  ScannedCount: number;
};

export type DynamoGetResponse = {
  Items: Array<Item>;
  Count: number;
  ScannedCount: number;
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
  style: Array<string>;
  type: Array<string>;
  required: Boolean;
};

export type RecipeItem = {
  name: string;
  style: string;
  required: boolean;
};

export type DietPreference = "carnivore" | "vegan" | "vegetarian";
