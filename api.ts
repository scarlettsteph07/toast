import { APIGatewayProxyEvent, Context } from "aws-lambda";

export const defaultEvent = async (originalFunction: Function) =>
  async (event: APIGatewayProxyEvent, _context: Context) => {
  try {
    const data = await originalFunction(event, _context);
    return {
      statusCode: '200',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(data),
    }
  } catch (e) {
    return {
      statusCode: '400',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: e.message,
      }),
    }
  }
}