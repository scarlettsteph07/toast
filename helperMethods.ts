import { requiredIngredients } from './config.json'

import { Ingredient, Preferences } from './types/'

export const getRandomArrayIndex = (array: Array<string> | Array<Ingredient>): number => {
  return Math.floor(Math.random() * array.length)
}

export const getIngredientStyle = (styleArray: Array<string>) => {
  const index = getRandomArrayIndex(styleArray)
  return styleArray[index]
}

export const getIngredientsHelper = ({ isCarnivore, numOfOptionalIngredients }: Preferences) => {
  const initialIngredients = requiredIngredients.map(requiredIngredient => {
    return getIngredientStyle(requiredIngredient.style)
  })
  const ingredientsArray = [...initialIngredients]

  let { optionalIngredients } = require("./config.json")
  if (isCarnivore) {
    const meat = optionalIngredients.find(
      (ingredient: Ingredient) => ingredient.name === "meat"
    )
    meat !== undefined && meat !== null && ingredientsArray.push(getIngredientStyle(meat.style))
    numOfOptionalIngredients--
  }

  for (let x = 0; x < numOfOptionalIngredients; x++) {
    const optionalIngredientIndex = getRandomArrayIndex(optionalIngredients)
    const optionalIngredient = optionalIngredients[optionalIngredientIndex]
    ingredientsArray.push(getIngredientStyle(optionalIngredient.style))

    optionalIngredients = optionalIngredients.filter((ingredient: Ingredient) => {
      return ingredient !== optionalIngredients[optionalIngredientIndex]
    })
  }

  const ingredients = ingredientsArray.map(ingredient => {
    return { name: ingredient }
  })

  return ingredients
}
