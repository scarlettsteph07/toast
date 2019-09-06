import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const eventWrapper = (originalFunction: Function) => async (
  event: APIGatewayProxyEvent,
  _context: Context,
) => {
  try {
    const data = await originalFunction(event);
    if (Object.keys(data).length === 0 && data.constructor === Object) {
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
    console.error('error: ', e);
    return {
      body: JSON.stringify({
        error: `${e.property ? e.property.split('.')[1] + ' ' : ''}${
          e.message
        }`,
      }),
      headers: DEFAULT_HEADERS,
      statusCode: '400',
    };
  }
};
