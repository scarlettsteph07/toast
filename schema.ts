
import { validate } from 'jsonschema'
import yml from 'js-yaml'

export const validateSchema = (interpolate: TemplateStringsArray): Function => {
  // obtain schema definition
  const definition = interpolate[0];
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
  }
}

export class RequestValidator {
  payload: any

  constructor(payload: any) {
    this.payload = payload
  }

  validateAddIngredient() {
    return this.validateAddIngredientsFunc(this.payload);
  }

  validateDeleteIngredientStyle() {
    return this.validateDeleteIngredientStyleFunc(this.payload);
  }

  validateGetIngredientsByUserId() {
    return this.validateGetIngredientsByUserIdFunc(this.payload);
  }

  validateGetNewRecipeParams() {
    return this.validateGetNewRecipeParamsFunc(this.payload);
  }

  validateAddIngredientsFunc = validateSchema`
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

  validateDeleteIngredientStyleFunc = validateSchema`
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

  validateGetIngredientsByUserIdFunc = validateSchema`

  `;

  validateGetNewRecipeParamsFunc = validateSchema`
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
      ignoredIngredients:
        type: array
        items:
          type: object
          properties:
            name:
              type: string
            style:
              type: string
      dietPreference:
        type: string
    required:
      - numOfOptionalIngredients
  `;
}