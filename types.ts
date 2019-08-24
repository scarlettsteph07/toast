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

export type DynamoResponse = {
  Items: Array<Item>;
  Count: number;
  ScannedCount: number;
};
