import { validate } from "jsonschema";
import * as yml from "js-yaml";

import { UserIngredient, DeleteIngredientStyle, NewRecipe } from "types";

const addIngredientsSchema = `
    type: object
    properties:
      name:
        type: string
      style:
        type: array
        items:
          type: string
      type:
        type: array
        items:
          type: string
      required:
        type: boolean
    required:
      - name
      - style
  `;

const deleteIngredientsSchema = `
    type: object
    properties:
      name:
        type: string
      style:
        type: string
    required:
      - name
      - style
`;

const getNewRecipeSchema = `
    type: object
    properties:
      numOfOptionalIngredients:
        type: integer
      requestedIngredients:
        type: array
        items:
          type: object
          properties:
            name:
              type: string
            style:
              type: string
          required:
          - name
          - style
      ignoredIngredients:
        type: array
        items:
          type: object
          properties:
            name:
              type: string
            style:
              type: string
          required:
          - name
          - style
      dietPreference:
        type: string
    required:
      - numOfOptionalIngredients
`;

export const validateSchema = (
  interpolate: string,
): ((src: object) => object) => {
  // obtain schema definition
  const definition = interpolate;
  // load the yaml
  const schema = yml.safeLoad(definition);
  // return a validation function
  return (src: object) => {
    const { errors } = validate(src, schema);
    if (errors.length > 0) {
      throw errors[0];
    }
    // valid return original request
    return src;
  };
};

export class RequestValidator {
  private readonly payload: any;

  constructor(payload: any) {
    this.payload = payload;
  }

  public validateAddIngredient() {
    const userIngredient = <UserIngredient>this.payload;
    return validateSchema(addIngredientsSchema)(userIngredient);
  }

  public validateDeleteIngredientStyle() {
    const deleteIngredientStyle = <DeleteIngredientStyle>this.payload;
    return validateSchema(deleteIngredientsSchema)(deleteIngredientStyle);
  }

  public validateGetNewRecipeParams() {
    const getNewRecipeParams = <NewRecipe>this.payload;
    return validateSchema(getNewRecipeSchema)(getNewRecipeParams);
  }
}
