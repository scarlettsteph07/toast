import { before } from "mocha";

const expect = require("chai").expect;
const sinon = require("sinon");

process.on("unhandledRejection", e => {
  console.log("you forgot to return a Promise! Check your tests!" + e.message);
});

import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { BatchWriteItemInput } from "aws-sdk/clients/dynamodb";

AWS.config.update({ region: "us-east-1" });
let handler: any;

describe("handler", () => {
  it("should mock reading from DocumentClient", async () => {
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
    handler = require("./handler");

    const headers = { "X-User-Key": "1234" };
    const body = {
      numOfOptionalIngredients: 0,
      requestedIngredients: [],
      ignoredIngredients: [],
      dietPreference: "vegan"
    };

    const res = await handler.getNewRecipe({ body, headers }, {});

    let responseBody = JSON.parse(res.body);
    await expect(responseBody[0]).to.eql({
      style: "avocado",
      name: "avocado",
      required: true
    });
    return await expect(responseBody[1]).to.eql({
      style: "bagel",
      name: "bread",
      required: true
    });

    AWSMock.restore("DynamoDB.DocumentClient");
    sinon.restore(Math);
  });
});
