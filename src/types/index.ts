import { APIGatewayProxyEvent } from "aws-lambda";

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
  name: string;
};

export type GetAll = () => Promise<Ingredient[]>;
export type Constructor = (userKey: string) => void;

export type RequestValidatorClass = (
  payload: any,
) => {
  payload: any;
  validateAddIngredient(): any;
  validateAddIngredientStyle(): any;
  validateUpdateIngredientStyle(): any;
  validateDeleteIngredientStyle(): any;
  validateGetNewRecipeParams(): any;
};

export type RequestValidatorFile = {
  RequestValidator: RequestValidatorClass;
};

export type UserIngredientClass = new (
  userKey: string,
  dynamoDbClient: AWS.DynamoDB.DocumentClient,
) => {
  userKey: string;
  getAll(): Promise<Ingredient[]>;
  bulkCreateIngredients(defaultIngredients: Ingredient[]): Promise<boolean>;
  getItemByName(itemName: string): Promise<Item>;
  addIngredientStyle(
    itemName: string,
    itemStyle: string,
  ): Promise<UserIngredient>;
  updateByStyle(
    itemName: string,
    itemCurrentStyle: string,
    itemStyle: string,
  ): Promise<UserIngredient>;
  deleteByStyle(itemName: string, itemStyle: string): Promise<UserIngredient>;
  createIngredient(ingredient: Ingredient): Promise<UserIngredient>;
  getIngredientNameParams(name: string): IngredientNameParams;
};

export type UserIngredientFile = {
  UserIngredients: UserIngredientClass;
};

export type EventSanitizerClass = new (event: FilteredEvent) => {
  event: FilteredEvent;
  headers: any;
  body: any;
  eventFilterAddIngredient(): AddIngredientEvent;
  eventFilterAddIngredientStyle(): AddIngredientStyleEvent;
  eventFilterUpdateIngredientStyle(): UpdateIngredientStyleEvent;
  eventFilterDeleteIngredientStyle(): DeleteIngredientStyleEvent;
  eventFilterNewRecipe(): NewRecipeEvent;
  listIngredientsParams(): BaseIngredientEvent;
  parseEvent(): FilteredEvent;
  getUserKey(): string;
};

export type EventSanitizerFile = {
  EventSanitizer: EventSanitizerClass;
};

export type GetNewRecipeFunc = (
  event: FilteredEvent,
  dynamoDbClient: AWS.DynamoDB.DocumentClient,
) => Promise<RecipeIngredients>;

export type GetNewRecipe = (event: APIGatewayProxyEvent) => Promise<Response>;

export type UserIngredientFunc = (
  event: FilteredEvent,
  dynamoDbClient: AWS.DynamoDB.DocumentClient,
) => Promise<UserIngredient>;

export type GetIngredientsByUserIdFunc = (
  event: FilteredEvent,
  dynamoDbClient: AWS.DynamoDB.DocumentClient,
) => Promise<Ingredient[]>;

export type IngredientHandler = {
  getNewRecipeEvent: GetNewRecipeFunc;
  getNewRecipe: GetNewRecipe;
  addIngredientEvent: UserIngredientFunc;
  deleteIngredientStyleEvent: UserIngredientFunc;
};

export type Item = {
  name: string;
  required: boolean;
  style: string[];
  type: string[];
  userId: string;
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

export type AddIngredientStyleEvent = BaseIngredientEvent & AddIngredientStyle;

export type AddIngredientStyle = {
  name: string;
  style: string;
};

export type UpdateIngredientStyleEvent = BaseIngredientEvent &
  UpdateIngredientStyle;

export type UpdateIngredientStyle = {
  name: string;
  currentStyle: string;
  style: string;
};

export type DeleteIngredientStyleEvent = BaseIngredientEvent &
  DeleteIngredientStyle;

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

export type RecipeIngredients = {
  ingredients: RecipeItem[];
};

export type NewRecipeEvent = BaseIngredientEvent & {
  dietPreference: DietPreference;
  ignoredIngredients: RecipeItem[];
  numOfOptionalIngredients: number;
  requestedIngredients: RecipeItem[];
};

export type UserHeaders = {
  "X-User-Key"?: string;
  "x-user-key"?: string;
};

export type DietPreference = "carnivore" | "vegan" | "vegetarian";
