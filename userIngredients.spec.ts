import { expect } from 'chai';
import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import * as sinon from 'sinon';

import { UserIngredientFile } from './types';

AWS.config.update({ region: 'us-east-1' });
const validUserKey = '1234';

describe('user ingredients class', () => {
  describe('getAll', () => {
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
      const options = {
        endpoint: 'http://localhost:8000',
        region: 'localhost',
      };

      const userIngredient = new UserIngredients(
        validUserKey,
        new AWS.DynamoDB.DocumentClient(options),
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
});
