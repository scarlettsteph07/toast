
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