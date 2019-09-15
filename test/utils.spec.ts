import { expect } from "chai";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import * as AWS from "aws-sdk";

import { eventWrapper } from "src/utils/eventWrapper";
import { GetNewRecipeFunc, GetIngredientsByUserIdFunc } from "src/types";

AWS.config.update({ region: "us-east-1" });

const event: APIGatewayProxyEvent = {
  body: '{"foo":"bar"}',
  headers: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: "/tst-path",
  pathParameters: {},
  queryStringParameters: null,
  stageVariables: {},
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  requestContext: {
    accountId: "1343434",
    apiId: "123232",
    httpMethod: "POST",
    path: "/test/path",
    stage: "test",
    requestId: "232323",
    requestTimeEpoch: 34343434,
    resourcePath: "4321423423432",
    resourceId: "4324343243",
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      userArn: null,
      cognitoIdentityPoolId: null,
      sourceIp: "1.1.1.1",
      user: "3434",
      userAgent: "43434",
    },
  },
  resource: "",
};

const context: Context = {
  functionName: "test",
  callbackWaitsForEmptyEventLoop: false,
  functionVersion: "1.0",
  invokedFunctionArn: "arn:test:me",
  memoryLimitInMB: 1024,
  awsRequestId: "1234",
  logGroupName: "test log group",
  logStreamName: "test",
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

describe("utils", () => {
  describe("#eventWrapper", () => {
    it("should return a json body", async () => {
      const testFunc: GetNewRecipeFunc = async (event) => {
        expect(event.body).to.be.equal('{"foo":"bar"}');
        expect(event.httpMethod).to.be.equal("GET");
        expect(event.path).to.be.equal("/tst-path");

        return new Promise((resolve) => {
          resolve([
            {
              name: "name",
              required: false,
              style: "style",
            },
          ]);
        });
      };
      const eventWrapped = eventWrapper(testFunc);
      const output = await eventWrapped(event, context);
      expect(output.body).to.be.equal(
        '[{"name":"name","required":false,"style":"style"}]',
        "to return a json body payload",
      );
      expect(output.headers).to.be.deep.equal(
        {
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        "headers should equal defaults",
      );
      expect(output.statusCode).to.be.equal("200");
    });

    it("should return 403 if not user key header is sent", async () => {
      const testFunc: GetIngredientsByUserIdFunc = async () => {
        throw new Error("User Key is required");
      };
      const eventWrapped = eventWrapper(testFunc);
      const output = await eventWrapped(event, context);
      expect(output.body).to.be.equal(
        '{"message":"please provide user auth header"}',
        "to return a json body payload",
      );
      expect(output.statusCode).to.be.equal("403");
      expect(output.headers).to.be.deep.equal(
        {
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        "headers should equal defaults",
      );
    });

    it("should return 404 if no items are returned", async () => {
      const testFunc: GetIngredientsByUserIdFunc = async () => {
        return new Promise((resolve) => {
          resolve([]);
        });
      };
      const eventWrapped = eventWrapper(testFunc);
      const output = await eventWrapped(event, context);
      expect(output.body).to.be.equal(
        '{"error":"Item not found"}',
        "to return a json body payload",
      );
      expect(output.headers).to.be.deep.equal(
        {
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        "headers should equal defaults",
      );
      expect(output.statusCode).to.be.equal("404");
    });
  });
});
