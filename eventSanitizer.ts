import { APIGatewayProxyEvent } from "aws-lambda";

import {
  AddIngredientEvent,
  DeleteIngredientStyleEvent,
  BaseIngredientEvent,
  NewRecipeEvent
} from "./types";

export class EventSanitizer {
  event: APIGatewayProxyEvent;
  headers: any;
  body: any;

  constructor(event: APIGatewayProxyEvent) {
    this.event = event;
    const { headers, body } = this.parseEvent();
    this.headers = headers;
    this.body = body;
  }

  parseEvent(): any {
    return {
      headers:
        typeof this.event.headers === "string"
          ? JSON.parse(this.event.headers)
          : this.event.headers,
      body:
        typeof this.event.body === "string"
          ? JSON.parse(this.event.body)
          : this.event.body
    };
  }

  getUserKey(): string {
    const userKey = this.headers["X-User-Key"] || this.headers["x-user-key"];
    console.log("headrs: ", this.headers);
    if (!userKey) {
      throw new Error("User Key is required");
    }
    return userKey;
  }

  listIngredientsParams(): BaseIngredientEvent {
    return { userKey: this.getUserKey() };
  }

  eventFilterAddIngredient(): AddIngredientEvent {
    return {
      ingredient: {
        name: this.body.name,
        style: this.body.style,
        type: this.body.type,
        required: this.body.required,
        userKey: this.getUserKey()
      },
      userKey: this.getUserKey()
    };
  }

  eventFilterDeleteIngredientStyle(): DeleteIngredientStyleEvent {
    return {
      name: this.body.name,
      style: this.body.style,
      userKey: this.getUserKey()
    };
  }

  eventFilterNewRecipe(): NewRecipeEvent {
    console.log("body", this.body);
    return {
      userKey: this.getUserKey(),
      ignoredIngredients: this.body.hasOwnProperty("ignoredIngredients")
        ? this.body.ignoredIngredients
        : [],
      requestedIngredients: this.body.hasOwnProperty("requestedIngredients")
        ? this.body.requestedIngredients
        : [],
      numOfOptionalIngredients: this.body.numOfOptionalIngredients,
      dietPreference: this.body.dietPreference
    };
  }
}
