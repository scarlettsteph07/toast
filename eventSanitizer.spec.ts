import { expect } from 'chai';

import { EventSanitizer } from './eventSanitizer';

const VALID_USER_KEY = '1234';
const headers = {
  'X-User-Key': VALID_USER_KEY,
};
const HTTP_METHODS = {
  POST: 'POST',
};
const PATHS = {
  NEW: '/ingredients/new',
};

describe('eventSanitizer', () => {
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
          path: PATHS.NEW,
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
          path: 'string',
        };
        const eventSanitizer = new EventSanitizer(eventWithString);
        expect(eventSanitizer.eventFilterAddIngredient()).to.deep.equal(
          addIngredientEvent,
        );
      });
    });
  });
});
