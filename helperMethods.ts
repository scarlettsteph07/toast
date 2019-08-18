import { ingredients } from "./config.json";

export type DietType = "Carnivore" | "Vegan" | "Vegetarian";

export type Preferences = {
  dietPreference?: DietType;
  numOfOptionalIngredients: number;
  ignoredIngredients?: Array<RecipeItem> | undefined | null;
  requestedIngredients?: Array<RecipeItem> | undefined | null;
};

type IngredientTemplate = {
  name: string;
  style: Array<string>;
  type: Array<string>;
  required: Boolean;
};

type RecipeItem = {
  name: string;
  style: string;
  required: boolean;
};

const getRandomArrayIndex = (array: Array<object>): number => {
  return Math.floor(Math.random() * array.length);
};

const getReguiredIngredient = (styleArray: Array<string>): string => {
  const index = getRandomArrayIndex(styleArray);
  return styleArray[index];
};

const filterByType = (
  ingredients: Array<IngredientTemplate>,
  type: DietType
): Array<IngredientTemplate> => {
  return ingredients.filter((ingredient: IngredientTemplate) => {
    if (ingredient.type.includes(type)) {
      return ingredient;
    }
  });


export const getIngredientsHelper = ({
  //dietPreference,
  //numOfOptionalIngredients,
  ignoredIngredients
}: //requestedIngredients
Preferences): Array<RecipeItem> => {
  const numOfRequiredIngredients = 
  const initialIngredients = randomizeRequiredIngredients(
    ingredients,
    ignoredIngredients
    //requestedIngredients
  );
  const ingredientsArray = [...initialIngredients];

  // let additionalIngredients = dietPreference
  //   ? filterByType(ingredients, dietPreference)
  //   : ingredients;

  // for (let x = 0; x < numOfOptionalIngredients; x++) {
  //   const optionalIngredientIndex = getRandomArrayIndex(additionalIngredients);
  //   const optionalIngredient = additionalIngredients[optionalIngredientIndex];

  //   ingredientsArray.push({
  //     style: getRandomIngredientStyle(optionalIngredient.style),
  //     name: optionalIngredient.name,
  //     required: false
  //   });

  //   additionalIngredients.splice(optionalIngredientIndex, 1);
  // }

  return ingredientsArray;
};
