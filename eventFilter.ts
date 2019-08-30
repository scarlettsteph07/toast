import { APIGatewayProxyEvent } from "aws-lambda";

import {
  AddIngredientEvent,
  DeleteIngredientStyleEvent,
} from "./types";

const parseBody = (event: APIGatewayProxyEvent): any => {
  return typeof event.body === "string"
      ? JSON.parse(event.body)
      : event.body;
}

const parseHeaders = (event: APIGatewayProxyEvent): any => {
  return typeof event.headers === "string"
    ? JSON.parse(event.headers)
    : event.headers;
}

const getUserKey = (headers: any): string => {
  return headers["X-User-Key"] || headers["x-user-key"]
}

export const eventFilter = (event: APIGatewayProxyEvent): AddIngredientEvent  => {
  const body = parseBody(event);
  const headers= parseHeaders(event);

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
  const body = parseBody(event);
  const headers= parseHeaders(event);

  return {
    name: body.name,
    style: body.style,
    userKey: getUserKey(headers)
  }
}