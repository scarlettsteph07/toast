import { validate } from "jsonschema";
const yml = require("js-yaml");

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
      - numOfOptionalIngredients`;

export const validateSchema = (interpolate: string): Function => {
  // obtain schema definition
  const definition = interpolate;
  // load the yaml
  const schema = yml.safeLoad(definition);
  // return a validation function
  return (src: object) => {
    const { errors } = validate(src, schema);
    if (errors && errors.length > 0) {
      throw errors[0];
    }
    // valid return original request
    return src;
  };
};

export class RequestValidator {
  payload: any;

  constructor(payload: any) {
    this.payload = payload;
  }

  validateAddIngredient() {
    return validateSchema(addIngredientsSchema)(this.payload);
  }

  validateDeleteIngredientStyle() {
    return validateSchema(deleteIngredientsSchema)(this.payload);
  }

  validateGetIngredientsByUserId() {
    const validator = validateSchema(addIngredientsSchema);
    return validator(this.payload);
  }

  validateGetNewRecipeParams() {
    const validator = validateSchema(getNewRecipeSchema);
    return validator(this.payload);
  }
}
