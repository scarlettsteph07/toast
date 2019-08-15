import { requiredIngredients, requiredIngredient2 } from './config.json'

import { Ingredient, Preferences } from './types/'

export const getRandomArrayIndex = (array: Array<string> | Array<Ingredient>): number => {
  return Math.floor(Math.random() * array.length)
}

export const getIngredientsHelper = ({ isCarnivore, numOfOptionalIngredients }: Preferences) => {
  let { optionalIngredients } = require("./config.json")
  const ingredientsArray = [...requiredIngredients]
  const ingredient2Index = getRandomArrayIndex(requiredIngredient2)
  ingredientsArray.push(requiredIngredient2[ingredient2Index])

  if (isCarnivore) {
    const meat = optionalIngredients.find(
      (ingredient: Ingredient) => ingredient.name === "meat"
    )
    console.log(meat)
    meat !== undefined && meat !== null && ingredientsArray.push(meat.style[getRandomArrayIndex(meat.style)])
    numOfOptionalIngredients--
  }

  for (let x = 0; x < numOfOptionalIngredients; x++) {
    const optionalIngredientIndex = getRandomArrayIndex(optionalIngredients)
    const optionalIngredient = optionalIngredients[optionalIngredientIndex]
    const optionalStyleIndex = getRandomArrayIndex(optionalIngredient.style)
    ingredientsArray.push(optionalIngredient.style[optionalStyleIndex])
    optionalIngredients = optionalIngredients.filter((ingredient: Ingredient) => {
      return ingredient !== optionalIngredients[optionalIngredientIndex]
    })
  }

  const ingredients = ingredientsArray.map(ingredient => {
    return { name: ingredient }
  })

  return ingredients
}
