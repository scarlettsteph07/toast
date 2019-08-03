const { requiredIngredients, requiredIngredient2 } = require("./config.json");
const { isCarnivore } = require("./preferences.json");

let { optionalIngredients } = require("./config.json");
let { numOfOptionalIngredients } = require("./preferences.json");

const randomArrayIndex = array => {
  return Math.floor(Math.random() * array.length);
};

const toast = [...requiredIngredients];
const ingredient2Index = randomArrayIndex(requiredIngredient2);
toast.push(requiredIngredient2[ingredient2Index]);

if (isCarnivore) {
  const meat = optionalIngredients.find(
    ingredient => ingredient.name === "meat"
  );
  toast.push(meat.style[randomArrayIndex(meat.style)]);
  numOfOptionalIngredients--;
}

for (x = 0; x < numOfOptionalIngredients; x++) {
  const optionalIngredientIndex = randomArrayIndex(optionalIngredients);
  const optionalIngredient = optionalIngredients[optionalIngredientIndex];
  const optionalStyleIndex = randomArrayIndex(optionalIngredient.style);
  toast.push(optionalIngredient.style[optionalStyleIndex]);
  optionalIngredients = optionalIngredients.filter((value, i) => {
    return value !== optionalIngredients[optionalIngredientIndex];
  });
}

console.log(toast);
