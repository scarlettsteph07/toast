import { ingredients } from "./config.json";

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

const getRandomArrayIndex = (array: Array<string | Object>): number => {
  return Math.floor(Math.random() * array.length);
};

class Recipe {
  ingredients: Array<IngredientTemplate>;
  numOfItems: number;
  ignoreRequiredItems: Array<RecipeItem>;
  ignoreOptionalItems: Array<RecipeItem>;
  requestRequiredItems: Array<RecipeItem>;
  requestOptionalItems: Array<RecipeItem>;
  chosenIngredients: Array<RecipeItem>;
  requiredIngredients: Array<IngredientTemplate>;
  optionalIngredients: Array<IngredientTemplate>;

  constructor(numOfItems: number) {
    this.ingredients = ingredients;
    this.numOfItems = numOfItems;
    this.ignoreRequiredItems = new Array();
    this.ignoreOptionalItems = new Array();
    this.requestRequiredItems = new Array();
    this.requestOptionalItems = new Array();
    this.chosenIngredients = new Array();
    this.requiredIngredients = this.filterRequiredIngredients();
    this.optionalIngredients = this.filterOptionalIngredients();
  }

  calculateOptionalIngredients(): void {
    this.chosenIngredients = this.chosenIngredients.concat(
      this.requestOptionalItems
    );

    if (this.numOfItems <= this.chosenIngredients.length) {
      return;
    }

    for (let i: number = 0; i < this.ignoreOptionalItems.length; i++) {
      this.optionalIngredients.map((x: IngredientTemplate, index: number) => {
        if (
          x.name === this.ignoreOptionalItems[i].name &&
          x.style.includes(this.ignoreOptionalItems[i].style)
        ) {
          x.style = x.style.filter(y => y != this.ignoreOptionalItems[i].style);
          
          if (x.style.length == 0) {
            this.optionalIngredients.splice(index, 1);
          }
        }
      });
    }
    // console.log("optional ingredients", this.requiredIngredients);

    const numRequiredMissing: number =
      this.numOfItems -
      this.chosenIngredients.length

    // console.log(
    //   "numreq",
    //   this.numOfItems,
    //   this.chosenIngredients.length
    // );

    this.optionalIngredients = this.optionalIngredients.filter(i => {
      if (this.requestOptionalItems.map(x => x.name).includes(i.name)) {
        return;
      } else {
        return i;
      }
    });

    //console.log('optional ingredients', this.optionalIngredients)

    for (let i: number = 0; i < numRequiredMissing; i++) {
      const randomArrayIndex = getRandomArrayIndex(this.optionalIngredients);
      const ingredientItem: IngredientTemplate = this.optionalIngredients[
        randomArrayIndex
      ];
      const randomStyleIndex: number = getRandomArrayIndex(
        ingredientItem.style
      );
      const ingredientStyle: string = ingredientItem.style[randomStyleIndex];

      this.chosenIngredients.push({
        style: ingredientStyle,
        name: ingredientItem.name,
        required: false
      });

      this.optionalIngredients.splice(randomArrayIndex, 1);
      //console.log("optional ingredients", this.optionalIngredients);
    }
    //console.log(this.chosenIngredients);
  }

  calculateRequiredIngredients(): void {
    this.chosenIngredients = this.chosenIngredients.concat(
      this.requestRequiredItems
    );
    if (this.requiredIngredients.length == this.requestRequiredItems.length) {
      return;
    }

    for (let i: number = 0; i < this.ignoreRequiredItems.length; i++) {
      this.requiredIngredients.map((x: IngredientTemplate) => {
        if (
          x.name === this.ignoreRequiredItems[i].name &&
          x.style.includes(this.ignoreRequiredItems[i].style)
        ) {
          x.style = x.style.filter(y => y != this.ignoreRequiredItems[i].style);
        }
      });
    }
    // console.log("requiredIngredients", this.requiredIngredients);

    const numRequiredMissing: number =
      this.requiredIngredients.length - this.requestRequiredItems.length;

    this.requiredIngredients = this.requiredIngredients.filter(i => {
      if (this.requestRequiredItems.map(x => x.name).includes(i.name)) {
        return;
      } else {
        return i;
      }
    });

    for (let i: number = 0; i < numRequiredMissing; i++) {
      const randomArrayIndex = getRandomArrayIndex(this.requiredIngredients);
      const ingredientItem: IngredientTemplate = this.requiredIngredients[
        randomArrayIndex
      ];
      const randomStyleIndex: number = getRandomArrayIndex(
        ingredientItem.style
      );
      const ingredientStyle: string = ingredientItem.style[randomStyleIndex];

      this.chosenIngredients.push({
        style: ingredientStyle,
        name: ingredientItem.name,
        required: true
      });

      this.requiredIngredients = this.requiredIngredients.splice(
        randomArrayIndex - 1,
        1
      );
    }
    //console.log(this.chosenIngredients);
  }

  ignoreIngredient(ingredient: RecipeItem) {
    if (ingredient.required) {
      this.ignoreRequiredItems.push(ingredient);
    } else {
      this.ignoreOptionalItems.push(ingredient);
    }
  }

  recipe() {
    return this.chosenIngredients;
  }

  requestIngredient(itemToRequest: RecipeItem) {
    if (itemToRequest.required) {
      this.requestRequiredItems.push(itemToRequest);
    } else {
      this.requestOptionalItems.push(itemToRequest);
    }
  }

  filterOptionalIngredients() {
    return this.ingredients.filter(i => i.required === false);
  }

  filterRequiredIngredients() {
    return this.ingredients.filter(i => i.required === true);
  }
}

let recipe = new Recipe(7);
// recipe.requestIngredient({ style: "bagel", name: "bread", required: true });
//recipe.ignoreIngredient({ style: "baguette", name: "bread", required: true });
recipe.requestIngredient({
  style: "red pepper flakes",
  name: "red pepper flakes",
  required: false
});
recipe.ignoreIngredient({
  style: "scrambled egg",
  name: "egg",
  required: false
});
recipe.calculateRequiredIngredients();
recipe.calculateOptionalIngredients();
console.log(recipe.recipe());
