import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  AddIngredientEvent,
  DeleteIngredientStyleEvent,
  BaseIngredientEvent,
  FilteredEvent,
  NewRecipeEvent,
} from './types';

export class EventSanitizer {
  private readonly event: FilteredEvent;
  private readonly headers: any;
  private readonly body: any;

  constructor(event: FilteredEvent) {
    this.event = event;
    const { headers, body } = this.parseEvent();
    this.headers = headers;
    this.body = body;
  }

  public eventFilterAddIngredient(): AddIngredientEvent {
    return {
      ingredient: {
        name: this.body.name,
        style: this.body.style,
        type: this.body.type,
        required: this.body.required,
        userKey: this.getUserKey(),
      },
      userKey: this.getUserKey(),
    };
  }

  public eventFilterDeleteIngredientStyle(): DeleteIngredientStyleEvent {
    return {
      name: this.body.name,
      style: this.body.style,
      userKey: this.getUserKey(),
    };
  }

  public eventFilterNewRecipe(): NewRecipeEvent {
    return {
      userKey: this.getUserKey(),
      ignoredIngredients: this.body.hasOwnProperty('ignoredIngredients')
        ? this.body.ignoredIngredients
        : [],
      requestedIngredients: this.body.hasOwnProperty('requestedIngredients')
        ? this.body.requestedIngredients
        : [],
      numOfOptionalIngredients: this.body.numOfOptionalIngredients,
      dietPreference: this.body.dietPreference,
    };
  }

  public listIngredientsParams(): BaseIngredientEvent {
    return { userKey: this.getUserKey() };
  }

  private parseEvent(): FilteredEvent {
    return {
      body:
        typeof this.event.body === 'string'
          ? JSON.parse(this.event.body)
          : this.event.body,
      headers:
        typeof this.event.headers === 'string'
          ? JSON.parse(this.event.headers)
          : this.event.headers,
      ...this.event,
    };
  }

  private getUserKey(): string {
    if (!this.headers) {
      throw new Error('User Key is required');
    }
    const userKey = this.headers['X-User-Key'] || this.headers['x-user-key'];

    if (!userKey) {
      throw new Error('User Key is required');
    }
    return userKey;
  }
}
