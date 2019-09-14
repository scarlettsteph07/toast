import { expect } from 'chai';

import { EventSanitizer } from './eventSanitizer';

const VALID_USER_KEY = '1234';
const headers = {
  'X-User-Key': VALID_USER_KEY,
};
const HTTP_METHODS = {
  DELETE: 'DELETE',
  GET: 'GET',
  POST: 'POST',
};
const PATHS = {
  INGREDIENTS: '/ingredients',
  NEW_INGREDIENTS: '/ingredients/new',
  RECIPES: '/recipes',
};

describe('eventSanitizer class', () => {
  describe('#eventFilterAddIngredient', () => {
    const newIngredientObject = {
      name: 'meat',
      required: true,
      style: ['bacon', 'sausage'],
      type: ['carnivore', 'vegetarian', 'vegan'],
    };
    const newIngredientString =
      '{"name": "meat", "style": ["bacon", "sausage"], "type": ["carnivore", "vegetarian", "vegan"],"required": true}';
    const addIngredientEvent = {
      ingredient: {
        ...newIngredientObject,
        userKey: VALID_USER_KEY,
      },
      userKey: VALID_USER_KEY,
    };

    describe('given a new ingredient object', () => {
      it('should return addIngredientEvent', () => {
        const eventWithObject = {
          body: newIngredientObject,
          headers,
          httpMethod: HTTP_METHODS.POST,
          path: PATHS.NEW_INGREDIENTS,
        };
        const eventSanitizer = new EventSanitizer(eventWithObject);
        expect(eventSanitizer.eventFilterAddIngredient()).to.deep.equal(
          addIngredientEvent,
        );
      });
    });

    describe('given a new ingredient string', () => {
      it('should return addIngredientEvent', () => {
        const eventWithString = {
          body: newIngredientString,
          headers,
          httpMethod: HTTP_METHODS.POST,
          path: PATHS.NEW_INGREDIENTS,
        };
        const eventSanitizer = new EventSanitizer(eventWithString);
        expect(eventSanitizer.eventFilterAddIngredient()).to.deep.equal(
          addIngredientEvent,
        );
      });
    });
  });

  describe('#eventFilterDeleteIngredientStyle', () => {
    const deleteIngredientObject = {
      name: 'beer',
      style: 'ipa',
    };
    const deleteIngredientString = '{"name": "beer", "style": "ipa"}';
    const deleteIngredientStyleEvent = {
      ...deleteIngredientObject,
      userKey: VALID_USER_KEY,
    };

    describe('given an ingredient object', () => {
      it('should return deleteIngredientStyleEvent', () => {
        const eventWithObject = {
          body: deleteIngredientObject,
          headers,
          httpMethod: HTTP_METHODS.DELETE,
          path: PATHS.INGREDIENTS,
        };
        const eventSanitizer = new EventSanitizer(eventWithObject);
        expect(eventSanitizer.eventFilterDeleteIngredientStyle()).to.deep.equal(
          deleteIngredientStyleEvent,
        );
      });
    });

    describe('given an ingredient string', () => {
      it('should return deleteIngredientStyleEvent', () => {
        const eventWithString = {
          body: deleteIngredientString,
          headers,
          httpMethod: HTTP_METHODS.DELETE,
          path: PATHS.INGREDIENTS,
        };
        const eventSanitizer = new EventSanitizer(eventWithString);
        expect(eventSanitizer.eventFilterDeleteIngredientStyle()).to.deep.equal(
          deleteIngredientStyleEvent,
        );
      });
    });
  });

  describe('#eventFilterNewRecipe', () => {
    const newRecipeObject = {
      dietPreference: 'vegan',
      ignoredIngredients: [],
      numOfOptionalIngredients: 5,
      requestedIngredients: [],
    };
    const newRecipeString =
      '{"numOfOptionalIngredients": 5, "requestedIngredients": [], "ignoredIngredients": [], "dietPreference": "vegan"}';
    const newRecipeEvent = {
      ...newRecipeObject,
      userKey: VALID_USER_KEY,
    };

    describe('given an new recipe object', () => {
      it('should return newRecipeEvent', () => {
        const eventWithObject = {
          body: newRecipeObject,
          headers,
          httpMethod: HTTP_METHODS.POST,
          path: PATHS.RECIPES,
        };
        const eventSanitizer = new EventSanitizer(eventWithObject);
        expect(eventSanitizer.eventFilterNewRecipe()).to.deep.equal(
          newRecipeEvent,
        );
      });
    });

    describe('given an new recipe string', () => {
      it('should return newRecipeEvent', () => {
        const eventWithObject = {
          body: newRecipeString,
          headers,
          httpMethod: HTTP_METHODS.POST,
          path: PATHS.RECIPES,
        };
        const eventSanitizer = new EventSanitizer(eventWithObject);
        expect(eventSanitizer.eventFilterNewRecipe()).to.deep.equal(
          newRecipeEvent,
        );
      });
    });
  });

  describe('#listIngredientsParams', () => {
    it('should return an object with the given user key', () => {
      const requestEvent = {
        body: {},
        headers,
        httpMethod: HTTP_METHODS.GET,
        path: PATHS.INGREDIENTS,
      };
      const ingredientsParams = {
        userKey: VALID_USER_KEY,
      };
      const eventSanitizer = new EventSanitizer(requestEvent);
      expect(eventSanitizer.listIngredientsParams()).to.deep.equal(
        ingredientsParams,
      );
    });
  });
});
