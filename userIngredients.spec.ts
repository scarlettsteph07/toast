import { expect } from 'chai';
import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import * as sinon from 'sinon';

import { defaultIngredients } from './config';

import { UserIngredientFile } from './types';

AWS.config.update({ region: 'us-east-1' });
const VALID_USER_KEY = '1234';
const OPTIONS = {
  endpoint: 'http://localhost:8000',
  region: 'localhost',
};

describe('user ingredients class', () => {
  describe('#getAll', () => {
    beforeEach((done) => {
      AWSMock.setSDKInstance(AWS);
      AWSMock.remock(
        'DynamoDB.DocumentClient',
        'query',
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: any) => any,
        ) => {
          callback(null, {
            Items: [
              {
                name: 'blah',
                required: true,
                style: [],
                type: [],
              },
            ],
            params,
          });
        },
      );
      done();
    });

    it('should get all user ingredients', async () => {
      const {
        UserIngredients,
      } = require('./userIngredients') as UserIngredientFile;

      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );

      const results = await userIngredient.getAll();
      expect(results).to.deep.equal([
        {
          name: 'blah',
          required: true,
          style: [],
          type: [],
        },
      ]);
    });

    afterEach(function() {
      sinon.restore();
      AWSMock.restore('DynamoDB.DocumentClient');
    });
  });

  describe('#bulkCreateIngredients', () => {
    it('should bulk create ingredients and return true', async () => {
      const {
        UserIngredients,
      } = require('./userIngredients') as UserIngredientFile;

      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );
      const results = await userIngredient.bulkCreateIngredients(
        defaultIngredients(),
      );
      expect(results).to.equal(true);
    });
  });
});
