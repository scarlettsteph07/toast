import {
  AddIngredientEvent,
  BaseIngredientEvent,
  DeleteIngredientStyle,
  DeleteIngredientStyleEvent,
  FilteredEvent,
  Ingredient,
  NewRecipe,
  NewRecipeEvent,
  UserHeaders,
} from "types";

export class EventSanitizer {
  private readonly body: any;
  private readonly event: FilteredEvent;
  private readonly headers: any;

  public constructor(event: FilteredEvent) {
    this.event = event;
    const { headers, body } = this.parseEvent();
    this.headers = headers;
    this.body = typeof body === "string" ? JSON.parse(body) : body;
  }

  public eventFilterAddIngredient(): AddIngredientEvent {
    const { name, required, style, type } = <Ingredient>this.body;
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
    const { name, style } = <DeleteIngredientStyle>this.body;
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
    } = <NewRecipe>this.body;

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

  private getUserKey(): string {
    if (!this.headers) {
      throw new Error("User Key is required");
    }

    const headers = <UserHeaders>this.headers;
    const userKey =
      headers["X-User-Key"] !== undefined
        ? headers["X-User-Key"]
        : headers["x-user-key"];

    if (userKey === undefined) {
      throw new Error("User Key is required");
    }

    return userKey;
  }

  private parseEvent(): FilteredEvent {
    return {
      body:
        typeof this.event.body === "string"
          ? <object>JSON.parse(this.event.body)
          : this.event.body,
      headers:
        typeof this.event.headers === "string"
          ? <object>JSON.parse(this.event.headers)
          : this.event.headers,
      ...this.event,
    };
  }
}
