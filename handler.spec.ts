import { expect } from 'chai';
import * as sinon from 'sinon';

process.on('unhandledRejection', (e) => {
  console.log(`you forgot to return a Promise! Check your tests! ${e.message}`);
});

import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';

import { Response, FilteredEvent, IngredientHandler } from './types';

AWS.config.update({ region: 'us-east-1' });

const headers = { 'X-User-Key': '1234' };
const body = {
  dietPreference: 'vegan',
  ignoredIngredients: [],
  numOfOptionalIngredients: 0,
  requestedIngredients: [],
};

beforeEach(() => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock('DynamoDB.DocumentClient', 'batchWrite', Promise.resolve({}));
  AWSMock.mock('DynamoDB.DocumentClient', 'query', Promise.resolve({}));
});

describe('invalid new recipe events', () => {
  it('should error when numOptionalIngredients is not a number', async () => {
    const payload: FilteredEvent = {
      body: JSON.stringify({
        numOfOptionalIngredients: 'not a number',
        ...body,
      }),
      headers,
      httpMethod: 'POST',
      path: '/test',
    };
    try {
      const { getNewRecipeEvent } = require('./handler') as IngredientHandler;
      await getNewRecipeEvent(payload);
    } catch (e) {
      expect(e).to.eq('instance.numOfOptionalIngredients');
      expect(e).to.have.property('message', 'is not of a type(s) integer');
    }
  });

  it('should error when user key header is missing', async () => {
    const payload: FilteredEvent = {
      body: JSON.stringify({
        numOfOptionalIngredients: 'not a number',
        ...body,
      }),
      headers: {},
      httpMethod: 'POST',
      path: '/test',
    };
    try {
      const { getNewRecipeEvent } = require('./handler') as IngredientHandler;
      await getNewRecipeEvent(payload);
    } catch (e) {
      expect(e).to.have.property('message', 'User Key is required');
    }
  });
});

describe('valid new recipe events', () => {
  beforeEach(() => {
    sinon.stub(Math, 'random').returns(0);
    AWSMock.remock(
      'DynamoDB.DocumentClient',
      'batchWrite',
      Promise.resolve({ foo: 'expectedError' }),
    );
  });
  AWSMock.mock('DynamoDB.DocumentClient', 'query', Promise.resolve({}));

  it('should return two required items numIngredients is 0', async () => {
    // Overwriting DynamoDB.DocumentClient.get()
    const { getNewRecipe } = require('./handler') as IngredientHandler;
    const payload: 12 = {
      body,
      headers,
      httpMethod: 'POST',
      path: '/test',
    };
    const res: Promise<Response> = await getNewRecipe(payload);
    const responseBody = JSON.parse(res.body);

    expect(responseBody[0]).to.eql({
      name: 'avocado',
      required: true,
      style: 'avocado',
    });
    expect(responseBody[1]).to.eql({
      name: 'bread',
      required: true,
      style: 'bagel',
    });
  });

  it('should return 5 ingredient items', async () => {
    // Overwriting DynamoDB.DocumentClient.get()
    const handler = require('./handler');
    const payload = {
      ...body,
      numOfOptionalIngredients: 5,
    };
    const res = await handler.getNewRecipe({ body: payload, headers }, {});
    const responseBody = JSON.parse(res.body);

    //   expect(responseBody[0]).to.eql({
    //     name: 'avocado',
    //     required: true,
    //     style: 'avocado',
    //   });
    //   expect(responseBody[1]).to.eql({
    //     name: 'bread',
    //     required: true,
    //     style: 'bagel',
    //   });
    //   expect(responseBody[2]).to.eql({
    //     name: 'tomato',
    //     required: false,
    //     style: 'fresh tomato',
    //   });
    //   expect(responseBody[3]).to.eql({
    //     name: 'herbs',
    //     required: false,
    //     style: 'cilantro',
    //   });
    //   expect(responseBody[4]).to.eql({
    //     name: 'salt',
    //     required: false,
    //     style: 'sea salt',
    //   });
    expect(responseBody).to.have.lengthOf(5);
  });

  it.skip('should return items from dynamo db if they exist', async () => {
    const returnData = (params: AWS.DynamoDB.QueryInput): any => {
      expect(params['TableName']).to.eql('UserIngredients');
      expect(params['KeyConditionExpression']).to.eql('#userId = :userId');
      expect(params['ExpressionAttributeNames']).to.eql({
        '#userId': 'userId',
      });
      return Promise.resolve({
        Items: [
          {
            name: 'flower',
            required: true,
            style: ['smoke', 'eat', 'vape'],
            type: ['indica', 'cbd', 'sativa'],
          },
          {
            name: 'joint',
            required: true,
            style: ['smoke', 'eat', 'vape'],
            type: ['indica', 'cbd', 'sativa'],
          },
        ],
      });
    };
    AWSMock.remock('DynamoDB.DocumentClient', 'query', returnData);

    const payload = {
      ...body,
      dietPreference: 'indica',
      numOfOptionalIngredients: 2,
    };

    const handler = require('./handler');
    const res = await handler.getNewRecipe({ body: payload, headers }, {});
    const responseBody = JSON.parse(res.body);
    expect(responseBody).to.eql([
      {
        name: 'flower',
        required: true,
        style: 'smoke',
      },
      {
        name: 'joint',
        required: true,
        style: 'smoke',
      },
    ]);
    expect(responseBody).to.have.lengthOf(2);
  });

  afterEach(function() {
    sinon.restore();
    // AWSMock.restore();
  });
});
