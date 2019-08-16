import { requiredIngredients, optionalIngredients } from "./config.json";

export type Preferences = {
  isCarnivore: boolean;
  numOfOptionalIngredients: number;
};

export type Ingredient = {
  name: string;
  style: Array<string>;
};

export const getRandomArrayIndex = (
  array: Array<string> | Array<Ingredient>
): number => {
  return Math.floor(Math.random() * array.length);
};

export const getIngredientStyle = (styleArray: Array<string>) => {
  const index = getRandomArrayIndex(styleArray);
  return styleArray[index];
};

export const getIngredientsHelper = ({
  isCarnivore,
  numOfOptionalIngredients
}: Preferences) => {
  const initialIngredients = requiredIngredients.map(requiredIngredient => {
    return getIngredientStyle(requiredIngredient.style);
  });
  const ingredientsArray = [...initialIngredients];

  if (isCarnivore) {
    const meat = optionalIngredients.find(
      (ingredient: Ingredient) => ingredient.name === "meat"
    );
    meat !== undefined &&
      meat !== null &&
      ingredientsArray.push(getIngredientStyle(meat.style));
    numOfOptionalIngredients--;
  }

  let additionalIngredients = optionalIngredients;
  for (let x = 0; x < numOfOptionalIngredients; x++) {
    const optionalIngredientIndex = getRandomArrayIndex(additionalIngredients);
    const optionalIngredient = additionalIngredients[optionalIngredientIndex];
    ingredientsArray.push(getIngredientStyle(optionalIngredient.style));

    additionalIngredients = additionalIngredients.filter(
      (ingredient: Ingredient) => {
        return ingredient !== additionalIngredients[optionalIngredientIndex];
      }
    );
  }

  const ingredients = ingredientsArray.map(ingredient => {
    return { name: ingredient };
  });

  return ingredients;
};
