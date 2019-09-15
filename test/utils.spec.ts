import { expect } from "chai";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as context from "aws-lambda-mock-context";

import { eventWrapper } from "src/utils/eventWrapper";
import { GetNewRecipeFunc, GetIngredientsByUserIdFunc } from "src/types";

AWS.config.update({ region: "us-east-1" });

const event: APIGatewayProxyEvent = {
  body: "",
  headers: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: "",
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

describe("utils", () => {
  describe("#eventWrapper", () => {
    it("should return a json body", async () => {
      const testFunc: GetNewRecipeFunc = async () => {
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
      const ctx = context({ timeout: 10 });
      const eventWrapped = eventWrapper(testFunc);
      const output = await eventWrapped(event, ctx);
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

    it("should return 404 if no items are returned", async () => {
      const testFunc: GetIngredientsByUserIdFunc = async () => {
        return new Promise((resolve) => {
          resolve([]);
        });
      };
      const ctx = context({ timeout: 10 });
      const eventWrapped = eventWrapper(testFunc);
      const output = await eventWrapped(event, ctx);
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
