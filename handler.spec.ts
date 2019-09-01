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

beforeEach(() => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock("DynamoDB.DocumentClient", "batchWrite", () => {
    return Promise.resolve({});
  });
  AWSMock.mock("DynamoDB.DocumentClient", "query", () => {
    return Promise.resolve({});
  });
});

describe("invalid new recipe events", () => {
  it("should error when numOptionalIngredients is not a number", async () => {
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
    const handler = require("./handler");
    try {
      await handler.getNewRecipeEvent({ body }, {});
    } catch (e) {
      expect(e).to.have.property("message", "User Key is required");
    }
  });
});

describe("valid new recipe events", () => {
  beforeEach(() => {
    sinon.stub(Math, "random").returns(0);
    //AWSMock.setSDKInstance(AWS);
    AWSMock.remock(
      "DynamoDB.DocumentClient",
      "batchWrite",
      (params: BatchWriteItemInput, callback: Function) => {
        return Promise.resolve({ foo: "expectedError" });
      }
    );
    AWSMock.remock(
      "DynamoDB.DocumentClient",
      "query",
      (params: any, callback: Function) => {
        return Promise.resolve({});
      }
    );
  });

  it("should return two required items numIngredients is 0", async () => {
    // Overwriting DynamoDB.DocumentClient.get()
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

  it("should return 5 item", async () => {
    // Overwriting DynamoDB.DocumentClient.get()
    const handler = require("./handler");
    const payload = Object.assign({}, body, { numOfOptionalIngredients: 5 });
    const res = await handler.getNewRecipe({ body: payload, headers }, {});
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
    expect(responseBody[2]).to.eql({
      style: "fresh tomato",
      name: "tomato",
      required: false
    });
    expect(responseBody[3]).to.eql({
      style: "cilantro",
      name: "herbs",
      required: false
    });
    expect(responseBody[4]).to.eql({
      style: "sea salt",
      name: "salt",
      required: false
    });
    expect(responseBody).to.have.lengthOf(5);
  });

  afterEach(function() {
    sinon.restore();
    //AWSMock.restore();
  });
});
