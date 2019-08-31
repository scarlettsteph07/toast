import { APIGatewayProxyEvent, Context } from "aws-lambda";

const DEFAULT_HEADERS =  {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

export const eventWrapper = (originalFunction: Function) =>
async (event: APIGatewayProxyEvent, _context: Context) => {
  try {
    const data = await originalFunction(event, _context);
    if (Object.keys(data).length === 0 && data.constructor === Object) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Item not found"
        }),
        headers: DEFAULT_HEADERS
      };
    }
    return {
      statusCode: '200',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(data),
    }
  } catch (e) {
    console.error('error: ', e);
    return {
      statusCode: '400',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        error: `${e.property ? e.property.split(".")[1] + ' ' : ''}${e.message}`,
      }),
    }
  }
}