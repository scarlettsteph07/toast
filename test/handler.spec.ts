import { expect } from "chai";
import * as sinon from "sinon";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";

import { TABLES } from "src/utils/dynamodb";
import { FilteredEvent, IngredientHandler } from "src/types";
import { UserIngredients } from "src/models/userIngredients";

AWS.config.update({ region: "us-east-1" });

process.on("unhandledRejection", (e) => {
  // tslint:disable-next-line: no-unsafe-any
  console.log(`you forgot to return a Promise! Check your tests! ${e.message}`);
});

const headers = { "X-User-Key": "1234" };
const body = {
  dietPreference: "vegan",
  ignoredIngredients: [],
  numOfOptionalIngredients: 0,
  requestedIngredients: [],
};

beforeEach(() => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock(
    "DynamoDB.DocumentClient",
    "put",
    Promise.resolve({ Attributes: { foo: "bar" } }),
  );
  AWSMock.mock(
    "DynamoDB.DocumentClient",
    "batchWrite",
    Promise.resolve({ foo: "bar" }),
  );

  AWSMock.mock(
    "DynamoDB.DocumentClient",
    "query",
    (
      params: AWS.DynamoDB.QueryInput,
      callback: (something: any, otherthing: any) => any,
    ) => {
      callback(null, {
        Items: [],
        params,
      });
    },
  );
});
describe("invalid new recipe events", () => {
  it("should error when numOptionalIngredients is not a number", async () => {
    const payload: FilteredEvent = {
      body: JSON.stringify({
        numOfOptionalIngredients: "not a number",
        ...body,
      }),
      headers,
      httpMethod: "POST",
      path: "/test",
    };
    try {
      const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
      await getNewRecipeEvent(payload, new AWS.DynamoDB.DocumentClient());
    } catch (e) {
      expect(e).to.eq("instance.numOfOptionalIngredients");
      expect(e).to.have.property("message", "is not of a type(s) integer");
    }
  });

  it("should error when user key header is missing", async () => {
    const payload: FilteredEvent = {
      body: JSON.stringify({
        numOfOptionalIngredients: "not a number",
        ...body,
      }),
      headers: {},
      httpMethod: "POST",
      path: "/test",
    };
    try {
      const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
      await getNewRecipeEvent(payload, new AWS.DynamoDB.DocumentClient());
    } catch (e) {
      expect(e).to.have.property("message", "User Key is required");
    }
  });
});

describe("addIngredientEvent", () => {
  it.skip("should add a new ingredient for a user", async () => {
    const { addIngredientEvent } = <IngredientHandler>require("src/handlers");
    const payload: FilteredEvent = {
      body: '{"name": "test name","style":["test style"]}',
      headers,
      httpMethod: "POST",
      path: "/test",
    };

    const response = await addIngredientEvent(
      payload,
      new AWS.DynamoDB.DocumentClient(),
    );

    const res = {
      name: "meat",
      required: false,
      style: ["bacon", "ham", "sausage"],
      type: ["carnivore"],
      userId: "1234",
    };

    expect(response).to.deep.equal(res);
  });
});

describe("deleteIngredientStyleEvent", () => {
  it("should delete an ingredient for a user", async () => {
    const deleteResult = {
      userKey: "123",
      style: ["test style"],
      name: "name",
      type: ["test type"],
      required: true,
    };
    sinon
      .stub(UserIngredients.prototype, "deleteByStyle")
      .resolves(deleteResult);
    const { deleteIngredientStyleEvent } = <IngredientHandler>(
      require("src/handlers")
    );
    const payload: FilteredEvent = {
      body: '{"name": "test name","style": "test style"}',
      headers,
      httpMethod: "POST",
      path: "/test",
    };

    const response = await deleteIngredientStyleEvent(
      payload,
      new AWS.DynamoDB.DocumentClient(),
    );

    expect(response).to.deep.equal(deleteResult);
  });
});

describe("valid new recipe events", () => {
  beforeEach(() => {
    sinon.stub(Math, "random").returns(0);
    AWSMock.remock(
      "DynamoDB.DocumentClient",
      "batchWrite",
      Promise.resolve({ foo: "expectedError" }),
    );
    AWSMock.mock(
      "DynamoDB.DocumentClient",
      "query",
      Promise.resolve({ Items: [] }),
    );
  });

  it("should return two required items numIngredients is 0", async () => {
    // Overwriting DynamoDB.DocumentClient.get()
    const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
    const payload: FilteredEvent = {
      body,
      headers,
      httpMethod: "POST",
      path: "/test",
    };

    const recipeItems = await getNewRecipeEvent(
      payload,
      new AWS.DynamoDB.DocumentClient(),
    );

    expect(recipeItems.ingredients[0]).to.eql(
      {
        name: "avocado",
        required: true,
        style: "avocado",
      },
      "expected recipe item",
    );
    expect(recipeItems.ingredients[1]).to.eql(
      {
        name: "bread",
        required: true,
        style: "bagel",
      },
      "expected recipe item",
    );
  });

  it("should throw an error for an invalid ingredient name", async () => {
    const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
    const payload: FilteredEvent = {
      body: {
        ...body,
        ignoredIngredients: [
          {
            name: "not a name",
            style: "not a style",
          },
        ],
        numOfOptionalIngredients: 2,
      },
      headers,
      httpMethod: "POST",
      path: "/test",
    };

    try {
      await getNewRecipeEvent(payload, new AWS.DynamoDB.DocumentClient());
    } catch (e) {
      expect(<Error>e).to.have.property("message");
      const error = <Error>e;
      expect(error.message).to.eql("Invalid name for [not a name]");
    }
  });

  it("should throw an error for an invalid ingredient style", async () => {
    const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
    const payload: FilteredEvent = {
      body: {
        ...body,
        ignoredIngredients: [
          {
            name: "bread",
            style: "not a style",
          },
        ],
        numOfOptionalIngredients: 2,
      },
      headers,
      httpMethod: "POST",
      path: "/test",
    };

    try {
      await getNewRecipeEvent(payload, new AWS.DynamoDB.DocumentClient());
    } catch (e) {
      expect(<Error>e).to.have.property("message");
      const error = <Error>e;
      expect(error.message).to.eql("Invalid style for [not a style]");
    }
  });

  it("should return 5 ingredient items", async () => {
    const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
    const payload: FilteredEvent = {
      body: {
        ...body,
        numOfOptionalIngredients: 5,
      },
      headers,
      httpMethod: "POST",
      path: "/test",
    };
    const recipeItems = await getNewRecipeEvent(
      payload,
      new AWS.DynamoDB.DocumentClient(),
    );

    expect(recipeItems.ingredients[0]).to.eql(
      {
        name: "avocado",
        required: true,
        style: "avocado",
      },
      "returns first item ",
    );
    expect(recipeItems.ingredients[1]).to.eql(
      {
        name: "bread",
        required: true,
        style: "bagel",
      },
      "returns second item",
    );
    expect(recipeItems.ingredients[2]).to.eql(
      {
        name: "tomato",
        required: false,
        style: "fresh tomato",
      },
      "returns third item",
    );
    expect(recipeItems.ingredients[3]).to.eql(
      {
        name: "herbs",
        required: false,
        style: "cilantro",
      },
      "returns fourth item",
    );
    expect(recipeItems.ingredients[4]).to.eql(
      {
        name: "salt",
        required: false,
        style: "sea salt",
      },
      "returns fifth item",
    );
    expect(recipeItems.ingredients).to.have.lengthOf(5);
  });

  it("should return items from dynamo db if they exist", async () => {
    const returnData = (params: AWS.DynamoDB.QueryInput): any => {
      expect(params.TableName).to.eql(TABLES.USER_INGREDIENTS);
      expect(params.KeyConditionExpression).to.eql("#userId = :userId");
      expect(params.ExpressionAttributeNames).to.eql({
        "#userId": "userId",
      });
      return Promise.resolve({
        Items: [
          {
            name: "flower",
            required: true,
            style: ["smoke", "eat", "vape"],
            type: ["indica", "cbd", "sativa"],
          },
          {
            name: "joint",
            required: true,
            style: ["smoke", "eat", "vape"],
            type: ["indica", "cbd", "sativa"],
          },
        ],
      });
    };
    AWSMock.remock("DynamoDB.DocumentClient", "query", returnData);
    const { getNewRecipeEvent } = <IngredientHandler>require("src/handlers");
    const payload: FilteredEvent = {
      body: {
        ...body,
        dietPreference: "indica",
        numOfOptionalIngredients: 2,
      },
      headers,
      httpMethod: "POST",
      path: "/test",
    };

    const recipeItems = await getNewRecipeEvent(
      payload,
      new AWS.DynamoDB.DocumentClient(),
    );
    expect(recipeItems).to.eql(
      {
        ingredients: [
          {
            name: "flower",
            required: true,
            style: "smoke",
          },
          {
            name: "joint",
            required: true,
            style: "smoke",
          },
        ],
      },
      "to have happpened",
    );
    expect(recipeItems.ingredients).to.have.lengthOf(2);
  });

  afterEach(() => {
    sinon.restore();
    AWSMock.restore("DynamoDB.DocumentClient");
  });
});
