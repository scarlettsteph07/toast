import { requiredIngredients, requiredIngredient2 } from './config.json'

import { Ingredient, Preferences } from './types/'

export const randomArrayIndex = (array: Array<string> | Array<Ingredient>) => {
  return Math.floor(Math.random() * array.length);
}

export const getIngredientsHelper = ({ isCarnivore, numOfOptionalIngredients }: Preferences) => {
  let { optionalIngredients } = require("./config.json");

  const toast = [...requiredIngredients];
  const ingredient2Index = randomArrayIndex(requiredIngredient2);
  toast.push(requiredIngredient2[ingredient2Index]);

  if (isCarnivore) {
    const meat = optionalIngredients.find(
      (ingredient: Ingredient) => ingredient.name === "meat"
    );
    console.log(meat);
    meat !== undefined && meat !== null && toast.push(meat.style[randomArrayIndex(meat.style)]);
    numOfOptionalIngredients--;
  }

  for (let x = 0; x < numOfOptionalIngredients; x++) {
    const optionalIngredientIndex = randomArrayIndex(optionalIngredients);
    const optionalIngredient = optionalIngredients[optionalIngredientIndex];
    const optionalStyleIndex = randomArrayIndex(optionalIngredient.style);
    toast.push(optionalIngredient.style[optionalStyleIndex]);
    optionalIngredients = optionalIngredients.filter((value: Ingredient) => {
      return value !== optionalIngredients[optionalIngredientIndex];
    });
  }

  const ingredients = toast.map(ingredient => {
    return { name: ingredient }
  })

  return ingredients
}
