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

export type UserIngredient = {
  userKey: string
} & Ingredient

export type DynamoQueryResponse = {
  Items: Array<Item>;
  Count: number;
  ScannedCount: number;
};

export type DynamoGetResponse = {
  Item: Item;
  Items: Array<Item>;
  Count: number;
  ScannedCount: number;
};

export type IngredientNameParams = {
  TableName: string,
  Key: {
    userId: string,
    name: string,
  }
};

export type AddIngredientEvent = {
  ingredient: UserIngredient;
  userKey: string;
};

export type DeleteIngredientStyleEvent = {
  name: string,
  style: string,
  userKey: string
}