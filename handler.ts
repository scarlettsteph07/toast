"use strict";

const { requiredIngredients, requiredIngredient2 } = require("./config.json");

const randomArrayIndex = array => {
  return Math.floor(Math.random() * array.length);
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

const errorResponse = message => {
  return {
    statusCode: 403,
    body: {
      message
    }
  };
};

module.exports.getIngredients = async (event, context) => {
  let { optionalIngredients } = require("./config.json");

  if (!event.body) {
    return errorResponse("Missing event body!");
  }
  let { isCarnivore, numOfOptionalIngredients } = JSON.parse(event.body);

  const toast = [...requiredIngredients];
  const ingredient2Index = randomArrayIndex(requiredIngredient2);
  toast.push(requiredIngredient2[ingredient2Index]);

  if (isCarnivore) {
    const meat = optionalIngredients.find(
      ingredient => ingredient.name === "meat"
    );
    console.log(meat);
    toast.push(meat.style[randomArrayIndex(meat.style)]);
    numOfOptionalIngredients--;
  }

  for (let x = 0; x < numOfOptionalIngredients; x++) {
    const optionalIngredientIndex = randomArrayIndex(optionalIngredients);
    const optionalIngredient = optionalIngredients[optionalIngredientIndex];
    const optionalStyleIndex = randomArrayIndex(optionalIngredient.style);
    toast.push(optionalIngredient.style[optionalStyleIndex]);
    optionalIngredients = optionalIngredients.filter((value, i) => {
      return value !== optionalIngredients[optionalIngredientIndex];
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients: toast
    }),
    headers
  };
};
