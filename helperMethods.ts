import { requiredIngredients, optionalIngredients } from "./config.json";

export type DietType = "Carnivore" | "Vegan" | "Vegetarian";

type Preferences = {
  dietPreference?: DietType;
  numOfOptionalIngredients: number;
};

type Ingredient = {
  name: String;
  style: Array<String>;
  type: Array<String>;
};

type RecipeItem = {
  name: String;
};

const getRandomArrayIndex = (
  array: Array<String> | Array<Ingredient>
): number => {
  return Math.floor(Math.random() * array.length);
};

const getRandomIngredientStyle = (styleArray: Array<String>): String => {
  const index = getRandomArrayIndex(styleArray);
  return styleArray[index];
};

export const filterByType = (
  ingredients: Array<Ingredient>,
  type: DietType
): Array<Ingredient> => {
  return ingredients.filter((ingredient: Ingredient) => {
    if (ingredient.type.includes(type)) {
      return ingredient;
    }
  });
};

export const randomizeRequiredIngredients = (
  ingredients: Array<Ingredient> | Array<Ingredient>
) : Array<String> => {
  return ingredients.map(requiredIngredient => {
    return getRandomIngredientStyle(requiredIngredient.style);
  });
};

export const getIngredientsHelper = ({
  dietPreference,
  numOfOptionalIngredients
}: Preferences): Array<RecipeItem> => {
  const initialIngredients = randomizeRequiredIngredients(requiredIngredients);
  const ingredientsArray = [...initialIngredients];

  let additionalIngredients = dietPreference
    ? filterByType(optionalIngredients, dietPreference)
    : optionalIngredients;

  for (let x = 0; x < numOfOptionalIngredients; x++) {
    const optionalIngredientIndex = getRandomArrayIndex(additionalIngredients);
    const optionalIngredient = additionalIngredients[optionalIngredientIndex];

    ingredientsArray.push(getRandomIngredientStyle(optionalIngredient.style));

    additionalIngredients.splice(optionalIngredientIndex, 1);
  }

  return ingredientsArray.map(ingredient => {
    return { name: ingredient };
  });
};
