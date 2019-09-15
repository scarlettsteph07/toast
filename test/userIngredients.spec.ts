import { expect } from "chai";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import * as sinon from "sinon";

import { config } from "src/utils/config";
import { TABLES } from "src/utils/dynamodb";

import { UserIngredientFile } from "src/types";

AWS.config.update({ region: "us-east-1" });
const VALID_USER_KEY = "1234";
const OPTIONS = {
  endpoint: "http://localhost:8000",
  region: "localhost",
};

describe("user ingredients class", () => {
  describe("#getAll", () => {
    beforeEach(() => {
      AWSMock.setSDKInstance(AWS);
      AWSMock.remock(
        "DynamoDB.DocumentClient",
        "query",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: any) => any,
        ) => {
          callback(null, {
            Items: [
              {
                name: "blah",
                required: true,
                style: [],
                type: [],
              },
            ],
            params,
          });
        },
      );
    });

    it("should get all user ingredients", async () => {
      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );

      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );

      const results = await userIngredient.getAll();
      expect(results).to.deep.equal(
        [
          {
            name: "blah",
            required: true,
            style: [],
            type: [],
          },
        ],
        "returns ingredients",
      );
    });

    afterEach(() => {
      sinon.restore();
      AWSMock.restore("DynamoDB.DocumentClient");
    });
  });

  describe("#bulkCreateIngredients", () => {
    it("should bulk create ingredients and return true", async () => {
      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );

      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );
      const results = await userIngredient.bulkCreateIngredients(config());
      expect(results).to.equal(true, "return the correct results");
    });
  });

  describe("#getItemByName", () => {
    beforeEach(() => {
      AWSMock.setSDKInstance(AWS);
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "get",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: any) => any,
        ) => {
          callback(null, {
            Item: {
              name: "black pepper",
              required: false,
              style: ["black pepper"],
              type: ["carnivore", "vegetarian", "vegan"],
              userId: VALID_USER_KEY,
            },
            params,
          });
        },
      );
    });

    it("should get item given the name as string", async () => {
      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );

      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );
      const results = await userIngredient.getItemByName("black pepper");
      expect(results).to.deep.equal(
        {
          name: "black pepper",
          required: false,
          style: ["black pepper"],
          type: ["carnivore", "vegetarian", "vegan"],
          userId: VALID_USER_KEY,
        },
        "expect item to equals",
      );
    });

    afterEach(() => {
      sinon.restore();
      AWSMock.restore("DynamoDB.DocumentClient");
    });
  });

  describe("#deleteByStyle", () => {
    const itemToDelete = {
      name: "meat",
      required: false,
      style: ["bacon"],
      type: ["carnivore"],
      userId: VALID_USER_KEY,
    };
    const itemToUpdate = {
      name: "meat",
      required: false,
      style: ["bacon", "ham", "sausage"],
      type: ["carnivore"],
      userId: VALID_USER_KEY,
    };
    const updatedItem = {
      name: "meat",
      required: false,
      style: ["ham", "sausage"],
      type: ["carnivore"],
      userId: VALID_USER_KEY,
    };

    beforeEach(() => {
      AWSMock.setSDKInstance(AWS);
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "get",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: object) => any,
        ) => {
          callback(null, {
            Item: itemToDelete,
            params,
          });
        },
      );
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "delete",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: object) => any,
        ) => {
          callback(null, {
            Attributes: itemToDelete,
            params,
          });
        },
      );
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "update",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: null, queryResult: object) => any,
        ) => {
          callback(null, {
            Attributes: updatedItem,
            params,
          });
        },
      );
    });

    it("should delete last item that matches given name and style", async () => {
      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );
      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );

      const results = await userIngredient.deleteByStyle(
        itemToDelete.name,
        itemToDelete.style[0],
      );
      expect(results).to.deep.equal(itemToDelete);
    });

    it("should update existing item styles given a valid name and style", async () => {
      AWSMock.remock(
        "DynamoDB.DocumentClient",
        "get",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: object) => any,
        ) => {
          callback(null, {
            Item: itemToUpdate,
            params,
          });
        },
      );

      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );
      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );

      const results = await userIngredient.deleteByStyle(
        itemToDelete.name,
        itemToDelete.style[0],
      );
      expect(results).to.deep.equal(updatedItem);
    });
  });

  describe("#createIngredient", () => {
    const itemToCreate = {
      name: "beer",
      required: false,
      style: ["ipa"],
      type: ["carnivore", "vegetarian", "vegan"],
      userId: VALID_USER_KEY,
    };

    beforeEach(() => {
      AWSMock.setSDKInstance(AWS);
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "put",
        (
          params: AWS.DynamoDB.QueryInput,
          callback: (something: any, otherthing: object) => any,
        ) => {
          callback(null, {
            Attributes: itemToCreate,
            params,
          });
        },
      );
    });

    it("should add a new item given an Ingredient object", async () => {
      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );
      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );

      const result = await userIngredient.createIngredient(itemToCreate);
      expect(result).to.deep.equal(itemToCreate);
    });
  });

  describe("#getIngredientNameParams", () => {
    const params = {
      Key: {
        name: "item name",
        userId: "1234",
      },
      TableName: TABLES.USER_INGREDIENTS,
    };

    it("should return a params object", () => {
      const { UserIngredients } = <UserIngredientFile>(
        require("src/models/userIngredients")
      );
      const userIngredient = new UserIngredients(
        VALID_USER_KEY,
        new AWS.DynamoDB.DocumentClient(OPTIONS),
      );
      const result = userIngredient.getIngredientNameParams("item name");
      expect(result).to.deep.equal(params);
    });
  });
});
