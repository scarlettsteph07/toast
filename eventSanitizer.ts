// import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  AddIngredientEvent,
  DeleteIngredientStyleEvent,
  BaseIngredientEvent,
  NewRecipe,
  FilteredEvent,
  NewRecipeEvent,
  Ingredient,
  DeleteIngredientStyle,
  UserHeaders,
} from './types';

export class EventSanitizer {
  private readonly event: FilteredEvent;
  private readonly headers: any;
  private readonly body: any;

  constructor(event: FilteredEvent) {
    this.event = event;
    const { headers, body } = this.parseEvent();
    this.headers = headers;
    this.body = typeof body === 'string' ? JSON.parse(body) : body;
  }

  public eventFilterAddIngredient(): AddIngredientEvent {
    const { name, required, style, type } = this.body as Ingredient;
    return {
      ingredient: {
        name,
        required,
        style,
        type,
        userKey: this.getUserKey(),
      },
      userKey: this.getUserKey(),
    };
  }

  public eventFilterDeleteIngredientStyle(): DeleteIngredientStyleEvent {
    const { name, style } = this.body as DeleteIngredientStyle;
    return {
      name,
      style,
      userKey: this.getUserKey(),
    };
  }

  public eventFilterNewRecipe(): NewRecipeEvent {
    const {
      dietPreference,
      ignoredIngredients,
      numOfOptionalIngredients,
      requestedIngredients,
    } = this.body as NewRecipe;

    return {
      dietPreference,
      ignoredIngredients:
        ignoredIngredients !== undefined ? ignoredIngredients : [],
      numOfOptionalIngredients,
      requestedIngredients:
        requestedIngredients !== undefined ? requestedIngredients : [],
      userKey: this.getUserKey(),
    };
  }

  public listIngredientsParams(): BaseIngredientEvent {
    return { userKey: this.getUserKey() };
  }

  private parseEvent(): FilteredEvent {
    return {
      body:
        typeof this.event.body === 'string'
          ? (JSON.parse(this.event.body) as object)
          : this.event.body,
      headers:
        typeof this.event.headers === 'string'
          ? (JSON.parse(this.event.headers) as object)
          : this.event.headers,
      ...this.event,
    };
  }

  private getUserKey(): string {
    if (!this.headers) {
      throw new Error('User Key is required');
    }
    const { headers } = this.headers as UserHeaders;
    const userKey =
      headers['X-User-Key'] !== undefined
        ? headers['X-User-Key']
        : headers['x-user-key'];

    if (userKey === undefined) {
      throw new Error('User Key is required');
    }
    return userKey;
  }
}
