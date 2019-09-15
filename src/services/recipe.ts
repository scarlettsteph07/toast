import { RecipeItem, Ingredient, DietPreference } from "src/types";

// tslint:disable-next-line: prefer-array-literal
const getRandomArrayIndex = (array: Array<string | object>): number =>
  // tslint:disable-next-line: insecure-random
  Math.floor(Math.random() * array.length);

const DEFAULT_DIET_PREFERENCE = "carnivore";

export class Recipe {
  private readonly ingredients: Ingredient[];
  private readonly numOfItems: number;
  private readonly ignoreRequiredItems: RecipeItem[];
  private readonly ignoreOptionalItems: RecipeItem[];
  private readonly requestRequiredItems: RecipeItem[];
  private readonly requestOptionalItems: RecipeItem[];
  private chosenIngredients: RecipeItem[];
  private requiredIngredients: Ingredient[];
  private optionalIngredients: Ingredient[];
  private dietPreference: DietPreference;

  constructor(ingredients: Ingredient[], numOfItems: number) {
    this.ingredients = [...ingredients];
    this.numOfItems = numOfItems;
    this.ignoreRequiredItems = [];
    this.ignoreOptionalItems = [];
    this.requestRequiredItems = [];
    this.requestOptionalItems = [];
    this.chosenIngredients = [];
    this.dietPreference = DEFAULT_DIET_PREFERENCE;
    this.requiredIngredients = [
      ...this.filterRequiredIngredients(this.dietPreference),
    ];
    this.optionalIngredients = [
      ...this.filterOptionalIngredients(this.dietPreference),
    ];
  }

  public setDietPreference(dietPreference: DietPreference): void {
    this.dietPreference = dietPreference;
    this.requiredIngredients = this.filterRequiredIngredients(
      this.dietPreference,
    );
    this.optionalIngredients = this.filterOptionalIngredients(
      this.dietPreference,
    );
  }

  public ignoreIngredient(ingredient: RecipeItem) {
    if (ingredient.required) {
      this.ignoreRequiredItems.push({ ...ingredient });
    } else {
      this.ignoreOptionalItems.push({ ...ingredient });
    }
  }

  public recipe(): RecipeItem[] {
    this.calculateRequiredIngredients();
    this.calculateOptionalIngredients();

    return this.chosenIngredients;
  }

  public requestIngredient(itemToRequest: RecipeItem) {
    if (itemToRequest.required) {
      this.requestRequiredItems.push({ ...itemToRequest });
    } else {
      this.requestOptionalItems.push({ ...itemToRequest });
    }
  }

  private calculateOptionalIngredients(): void {
    this.chosenIngredients = this.chosenIngredients.concat(
      this.requestOptionalItems,
    );

    if (this.numOfItems <= this.chosenIngredients.length) {
      return;
    }

    for (const ignoreIngredient of this.ignoreOptionalItems) {
      this.optionalIngredients.map((x: Ingredient, index: number) => {
        if (
          x.name === ignoreIngredient.name &&
          x.style.includes(ignoreIngredient.style)
        ) {
          x.style = x.style.filter((y) => y !== ignoreIngredient.style);

          if (x.style.length === 0) {
            this.optionalIngredients.splice(index, 1);
          }
        }
      });
    }

    const numRequiredMissing: number =
      this.numOfItems - this.chosenIngredients.length;

    this.optionalIngredients = this.optionalIngredients.filter((i) => {
      if (
        this.requestOptionalItems
          .map((optionalItem) => optionalItem.name)
          .includes(i.name)
      ) {
        return undefined;
      }
      return i;
    });

    for (let i = 0; i < numRequiredMissing; i += 1) {
      const randomArrayIndex = getRandomArrayIndex(this.optionalIngredients);
      const ingredientItem: Ingredient = this.optionalIngredients[
        randomArrayIndex
      ];
      const randomStyleIndex: number = getRandomArrayIndex(
        ingredientItem.style,
      );
      const ingredientStyle: string = ingredientItem.style[randomStyleIndex];

      this.chosenIngredients.push({
        name: ingredientItem.name,
        required: false,
        style: ingredientStyle,
      });

      this.optionalIngredients.splice(randomArrayIndex, 1);
    }
  }

  private calculateRequiredIngredients(): void {
    this.chosenIngredients = this.chosenIngredients.concat(
      this.requestRequiredItems,
    );
    if (this.requiredIngredients.length === this.requestRequiredItems.length) {
      return;
    }

    for (const ignoreRequiredItem of this.ignoreRequiredItems) {
      this.requiredIngredients.map((x: Ingredient) => {
        if (
          x.name === ignoreRequiredItem.name &&
          x.style.includes(ignoreRequiredItem.style)
        ) {
          if (x.style.length > 1) {
            x.style = x.style.filter((y) => y !== ignoreRequiredItem.style);
          }
        }
      });
    }

    const numRequiredMissing: number =
      this.requiredIngredients.length - this.requestRequiredItems.length;

    this.requiredIngredients = this.requiredIngredients.filter((i) => {
      if (this.requestRequiredItems.map((x) => x.name).includes(i.name)) {
        return undefined;
      }
      return i;
    });

    for (let i = 0; i < numRequiredMissing; i += 1) {
      const randomArrayIndex = getRandomArrayIndex(this.requiredIngredients);
      const ingredientItem: Ingredient = this.requiredIngredients[
        randomArrayIndex
      ];
      const randomStyleIndex: number = getRandomArrayIndex(
        ingredientItem.style,
      );
      const ingredientStyle: string = ingredientItem.style[randomStyleIndex];

      this.chosenIngredients.push({
        name: ingredientItem.name,
        required: true,
        style: ingredientStyle,
      });

      this.requiredIngredients.splice(randomArrayIndex, 1);
    }
  }

  private filterOptionalIngredients(dietPreference: DietPreference) {
    return this.ingredients.filter(
      (i) => !i.required && i.type.includes(dietPreference),
    );
  }

  private filterRequiredIngredients(dietPreference: DietPreference) {
    return this.ingredients.filter(
      (i) => i.required && i.type.includes(dietPreference),
    );
  }
}
