const expect = require("chai").expect;
const sinon = require("sinon");

process.on("unhandledRejection", e => {
  console.log("you forgot to return a Promise! Check your tests!" + e.message);
});

import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { BatchWriteItemInput } from "aws-sdk/clients/dynamodb";

AWS.config.update({ region: "us-east-1" });

const headers = { "X-User-Key": "1234" };
const body = {
  numOfOptionalIngredients: 0,
  requestedIngredients: [],
  ignoredIngredients: [],
  dietPreference: "vegan"
};

// it("should error when requested ingredients is not an array", async () => {});
beforeEach(async done => {
  //get requires env vars
  done();
});

describe("invalid new recipe events", () => {
  it("should error when numOptionalIngredients is not a number", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "batchWrite", () => {
      return Promise.resolve({ foo: "expectedError" });
    });
    AWSMock.mock("DynamoDB.DocumentClient", "query", () => {
      return Promise.resolve({});
    });

    const handler = require("./handler");
    const payload = {
      body: Object.assign({}, body, {
        numOfOptionalIngredients: "not a number"
      }),
      headers
    };
    try {
      await handler.getNewRecipeEvent(payload, {});
    } catch (e) {
      expect(e).to.have.property(
        "property",
        "instance.numOfOptionalIngredients"
      );
      expect(e).to.have.property("message", "is not of a type(s) integer");
    }
  });

  it("should error when user key header is missing", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      "DynamoDB.DocumentClient",
      "batchWrite",
      (params: BatchWriteItemInput) => {
        return Promise.resolve(params);
      }
    );
    AWSMock.mock(
      "DynamoDB.DocumentClient",
      "query",
      (params: any, callback: Function) => {
        return Promise.resolve({});
      }
    );
    const handler = require("./handler");
    try {
      await handler.getNewRecipeEvent({ body }, {})
    } catch(e) {
      expect(e).to.have.property("message", "User Key is required");
    }
  });

  afterEach(function() {
    //sinon.restore();
    //AWSMock.restore();
  });
});

describe("valid new recipe events", () => {
  it("should return two required items numIngredients is 0", async () => {
    // Overwriting DynamoDB.DocumentClient.get()
    sinon.stub(Math, "random").returns(0);
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      "DynamoDB.DocumentClient",
      "batchWrite",
      (params: BatchWriteItemInput, callback: Function) => {
        return Promise.resolve({ foo: "expectedError" });
      }
    );
    AWSMock.mock(
      "DynamoDB.DocumentClient",
      "query",
      (params: any, callback: Function) => {
        return Promise.resolve({});
      }
    );
    const handler = require("./handler");

    const res = await handler.getNewRecipe({ body, headers }, {});

    let responseBody = JSON.parse(res.body);

    expect(responseBody[0]).to.eql({
      style: "avocado",
      name: "avocado",
      required: true
    });
    expect(responseBody[1]).to.eql({
      style: "bagel",
      name: "bread",
      required: true
    });
  });

  afterEach(function() {
    //sinon.restore();
    //AWSMock.restore();
  });
});
