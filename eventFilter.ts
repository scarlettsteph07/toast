import { APIGatewayProxyEvent } from "aws-lambda";

import {
  AddIngredientEvent,
  DeleteIngredientStyleEvent,
} from "./types";

const parseEvent = (event: APIGatewayProxyEvent): any => {
  return {
    headers: typeof event.headers === "string"
    ? JSON.parse(event.headers)
    : event.headers,
    body: typeof event.body === "string"
      ? JSON.parse(event.body)
      : event.body
  }
}

const getUserKey = (headers: any): string => {
  return headers["X-User-Key"] || headers["x-user-key"]
}

export const eventFilter = (event: APIGatewayProxyEvent): AddIngredientEvent  => {
  const { body, headers } = parseEvent(event);

  return {
    ingredient: {
      name: body.name,
      style: body.style,
      type: body.type,
      required: body.required,
      userKey: getUserKey(headers)
    },
    userKey: getUserKey(headers)
  }
}

export const eventFilterDeleteIngredientStyle = (
  event: APIGatewayProxyEvent
) : DeleteIngredientStyleEvent => {
  const { body, headers } = parseEvent(event);

  return {
    name: body.name,
    style: body.style,
    userKey: getUserKey(headers)
  }
}