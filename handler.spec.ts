import { expect } from 'chai';
import * as sinon from 'sinon';

process.on('unhandledRejection', e => {
  console.log(`you forgot to return a Promise! Check your tests! ${e.message}`);
});

import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';

import { Response } from './types';

import { getNewRecipe, getNewRecipeEvent } from './handler';

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
    const payload: { Body } = {
      body: {
        numOfOptionalIngredients: 'not a number',
        ...body,
      },
      headers,
    };
    try {
      await getNewRecipeEvent(payload, {});
    } catch (e) {
      expect(e).to.have.property(
        'property',
        'instance.numOfOptionalIngredients',
      );
      expect(e).to.have.property('message', 'is not of a type(s) integer');
    }
  });

  it('should error when user key header is missing', async () => {
    const handler = require('./handler');
    try {
      await handler.getNewRecipeEvent({ body }, {});
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
    const handler: Response = require('./handler');
    const res: Promise<Response> = await handler.getNewRecipe(
      { body, headers },
      {},
    );
    const responseBody = JSON.parse(res.body);

    expect(responseBody[0]).to.eql({
      style: 'avocado',
      name: 'avocado',
      required: true,
    });
    expect(responseBody[1]).to.eql({
      style: 'bagel',
      name: 'bread',
      required: true,
    });
  });

  it('should return 5 item', async () => {
    // Overwriting DynamoDB.DocumentClient.get()
    const handler = require('./handler');
    const payload = Object.assign({}, body, { numOfOptionalIngredients: 5 });
    const res = await handler.getNewRecipe({ body: payload, headers }, {});
    let responseBody = JSON.parse(res.body);

    expect(responseBody[0]).to.eql({
      style: 'avocado',
      name: 'avocado',
      required: true,
    });
    expect(responseBody[1]).to.eql({
      style: 'bagel',
      name: 'bread',
      required: true,
    });
    expect(responseBody[2]).to.eql({
      style: 'fresh tomato',
      name: 'tomato',
      required: false,
    });
    expect(responseBody[3]).to.eql({
      style: 'cilantro',
      name: 'herbs',
      required: false,
    });
    expect(responseBody[4]).to.eql({
      style: 'sea salt',
      name: 'salt',
      required: false,
    });
    expect(responseBody).to.have.lengthOf(5);
  });

  it('should return items from dynamo db if they exist', async () => {
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
            style: ['smoke', 'eat', 'vape'],
            required: true,
            type: ['indica', 'cbd', 'sativa'],
          },
          {
            name: 'joint',
            style: ['smoke', 'eat', 'vape'],
            required: true,
            type: ['indica', 'cbd', 'sativa'],
          },
        ],
      });
    };
    AWSMock.remock('DynamoDB.DocumentClient', 'query', returnData);

    const payload = Object.assign({}, body, {
      dietPreference: 'indica',
      numOfOptionalIngredients: 2,
    });

    const handler = require('./handler');
    const res = await handler.getNewRecipe({ body: payload, headers }, {});
    const responseBody = JSON.parse(res.body);
    expect(responseBody).to.eql([
      {
        name: 'flower',
        style: 'smoke',
        required: true,
      },
      {
        name: 'joint',
        style: 'smoke',
        required: true,
      },
    ]);
    expect(responseBody).to.have.lengthOf(2);
  });

  afterEach(function() {
    sinon.restore();
    //AWSMock.restore();
  });
});
