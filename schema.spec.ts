import { expect } from 'chai';

import { RequestValidator } from './schema';

describe('RequestValidator class', () => {
  describe('#validateAddIngredient', () => {
    describe('if all required properties are received', () => {
      it('should return ingredient', () => {
        const ingredient = {
          name: 'beer',
          style: ['ipa'],
        };
        const requestValidator = new RequestValidator(ingredient);
        expect(requestValidator.validateAddIngredient()).to.equal(ingredient);
      });
    });

    describe('if any required properties are missing', () => {
      describe('if name', () => {
        describe('is not received', () => {
          const expectedErrorMessage = 'requires property "name"';
          it('should throw error when name is missing', () => {
            const ingredient = {
              style: ['ipa'],
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error when name is undefined', () => {
            const ingredient = {
              name: undefined,
              style: ['ipa'],
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
        });

        describe('is not a string', () => {
          const expectedErrorMessage = 'is not of a type(s) string';
          it('should throw error when name is a number', () => {
            const ingredientWithNumber = {
              name: 1,
              style: ['ipa'],
            };
            const requestValidator = new RequestValidator(ingredientWithNumber);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error when name is an array', () => {
            const ingredientWithArray = {
              name: [],
              style: ['ipa'],
            };
            const requestValidator = new RequestValidator(ingredientWithArray);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
        });
      });

      describe('if style', () => {
        describe('is not received', () => {
          const expectedErrorMessage = 'requires property "style"';
          it('should throw error if style is missing', () => {
            const ingredient = {
              name: 'beer',
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error if style is undefined', () => {
            const ingredient = {
              name: 'beer',
              style: undefined,
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
        });

        describe('is not an array', () => {
          const expectedErrorMessage = 'is not of a type(s) array';
          it('should throw error if style is a string', () => {
            const ingredient = {
              name: 'beer',
              style: 'ipa',
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error if style is null', () => {
            const ingredient = {
              name: 'beer',
              style: null,
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateAddIngredient.bind(requestValidator, ''),
            ).to.throw(expectedErrorMessage);
          });
        });
      });
    });
  });

  describe('#validateDeleteIngredientStyle', () => {
    describe('if all required properties are received', () => {
      it('should return ingredient', () => {
        const ingredient = {
          name: 'beer',
          style: 'ipa',
        };
        const requestValidator = new RequestValidator(ingredient);
        expect(requestValidator.validateDeleteIngredientStyle()).to.equal(
          ingredient,
        );
      });
    });

    describe('if any required properties are missing', () => {
      describe('if name', () => {
        describe('is not received', () => {
          const expectedErrorMessage = 'requires property "name"';
          it('should throw error when name is missing', () => {
            const ingredient = {
              style: 'ipa',
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error when name is undefined', () => {
            const ingredient = {
              name: undefined,
              style: 'ipa',
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
        });

        describe('is not a string', () => {
          const expectedErrorMessage = 'is not of a type(s) string';
          it('should throw error when name is a number', () => {
            const ingredientWithNumber = {
              name: 1,
              style: 'ipa',
            };
            const requestValidator = new RequestValidator(ingredientWithNumber);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error when name is an array', () => {
            const ingredientWithArray = {
              name: [],
              style: 'ipa',
            };
            const requestValidator = new RequestValidator(ingredientWithArray);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
        });
      });

      describe('if style', () => {
        describe('is not received', () => {
          const expectedErrorMessage = 'requires property "style"';
          it('should throw error if style is missing', () => {
            const ingredient = {
              name: 'beer',
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error if style is undefined', () => {
            const ingredient = {
              name: 'beer',
              style: undefined,
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
        });

        describe('is not a string', () => {
          const expectedErrorMessage = 'is not of a type(s) string';
          it('should throw error if style is an array', () => {
            const ingredient = {
              name: 'beer',
              style: ['ipa'],
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error if style is null', () => {
            const ingredient = {
              name: 'beer',
              style: null,
            };
            const requestValidator = new RequestValidator(ingredient);
            expect(
              requestValidator.validateDeleteIngredientStyle.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
        });
      });
    });
  });

  describe('#validateGetNewRecipeParams', () => {
    describe('if all required properties are received', () => {
      it('should return recipeParams', () => {
        const recipeParams = {
          ignoredIngredients: [{ name: 'beer', style: 'ipa', required: false }],
          numOfOptionalIngredients: 3,
          requestedIngredients: [
            { name: 'avocado', style: 'avocado', required: false },
            { name: 'bread', style: 'como', required: false },
          ],
        };
        const requestValidator = new RequestValidator(recipeParams);
        expect(requestValidator.validateGetNewRecipeParams()).to.equal(
          recipeParams,
        );
      });
    });

    describe('if any required properties are missing', () => {
      describe('if numOfOptionalIngredients', () => {
        describe('is not received', () => {
          const expectedErrorMessage =
            'requires property "numOfOptionalIngredients"';
          it('should throw error when numOfOptionalIngredients is missing', () => {
            const recipeParams = {};
            const requestValidator = new RequestValidator(recipeParams);
            expect(
              requestValidator.validateGetNewRecipeParams.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error when numOfOptionalIngredients is undefined', () => {
            const recipeParams = {
              numOfOptionalIngredients: undefined,
            };
            const requestValidator = new RequestValidator(recipeParams);
            expect(
              requestValidator.validateGetNewRecipeParams.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
        });

        describe('is not an integer', () => {
          const expectedErrorMessage = 'is not of a type(s) integer';
          it('should throw error when numOfOptionalIngredients is a string', () => {
            const paramsWithString = {
              numOfOptionalIngredients: '1',
            };
            const requestValidator = new RequestValidator(paramsWithString);
            expect(
              requestValidator.validateGetNewRecipeParams.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
          it('should throw error when numOfOptionalIngredients is an array', () => {
            const paramsWithArray = {
              numOfOptionalIngredients: [1],
            };
            const requestValidator = new RequestValidator(paramsWithArray);
            expect(
              requestValidator.validateGetNewRecipeParams.bind(
                requestValidator,
                '',
              ),
            ).to.throw(expectedErrorMessage);
          });
        });
      });
    });
  });
});
