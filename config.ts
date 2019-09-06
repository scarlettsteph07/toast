import { Ingredient } from './types';

export const defaultIngredients = (): Ingredient[] => [
  {
    name: 'avocado',
    required: true,
    style: ['avocado'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'bread',
    required: true,
    style: ['bagel', 'como bread', 'honey wheat bread', 'baguette'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'egg',
    required: false,
    style: ['poached egg', 'fried egg', 'scrambled egg'],
    type: ['carnivore', 'vegetarian'],
  },
  {
    name: 'cheese',
    required: false,
    style: ['cheddar cheese', 'monterrey jack cheese'],
    type: ['carnivore', 'vegetarian'],
  },
  {
    name: 'meat',
    required: false,
    style: ['bacon', 'ham', 'sausage'],
    type: ['carnivore'],
  },
  {
    name: 'tomato',
    required: false,
    style: ['fresh tomato', 'roasted tomato', 'sauté tomato'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'herbs',
    required: false,
    style: ['cilantro', 'basil'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'salt',
    required: false,
    style: ['sea salt'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'black pepper',
    required: false,
    style: ['black pepper'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'lemon juice',
    required: false,
    style: ['lemon juice'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'spread',
    required: false,
    style: ['olive oil', 'butter'],
    type: ['carnivore', 'vegetarian'],
  },
  {
    name: 'red pepper flakes',
    required: false,
    style: ['red pepper flakes'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'beans',
    required: false,
    style: ['fried beans', 'whole beans'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'jalapeños',
    required: false,
    style: ['pickled jalapeños', 'minced jalapeños'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'garlic',
    required: false,
    style: ['roasted garlic', 'minced garlic'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
  {
    name: 'seeds',
    required: false,
    style: ['toasted sunflower seeds', 'sesame seeds'],
    type: ['carnivore', 'vegetarian', 'vegan'],
  },
];
