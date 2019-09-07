import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import {
  GetNewRecipeFunc,
  FilteredEvent,
  IngredientStyleFunc,
  GetIngredientsByUserIdFunc,
  ErrorMessage,
} from './types';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const eventWrapper = (
  originalFunction:
    | GetNewRecipeFunc
    | IngredientStyleFunc
    | GetIngredientsByUserIdFunc,
) => async (event: APIGatewayProxyEvent, _context: Context) => {
  try {
    const filteredEvent = event as FilteredEvent;
    const data = await originalFunction(filteredEvent);
    if (Object.keys(data).length === 0) {
      return {
        body: JSON.stringify({
          error: 'Item not found',
        }),
        headers: DEFAULT_HEADERS,
        statusCode: 404,
      };
    }
    return {
      body: JSON.stringify(data),
      headers: DEFAULT_HEADERS,
      statusCode: '200',
    };
  } catch (e) {
    const error = e as ErrorMessage;
    return {
      body: JSON.stringify({
        error: `${error.property.split('.')[1]}}${error.message}`,
      }),
      headers: DEFAULT_HEADERS,
      statusCode: '400',
    };
  }
};
