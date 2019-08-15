"use strict"

import { getIngredientsHelper } from './helperMethods'

import { APIGatewayProxyEvent, Context } from 'aws-lambda'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

const getErrorResponse = (message: string) => {
  return {
    statusCode: 403,
    body: {
      message
    }
  }
}

export const getIngredients = async (event: APIGatewayProxyEvent, _context: Context) => {
  if (!event.body) {
    return getErrorResponse("Missing event body!")
  }

  let { isCarnivore, numOfOptionalIngredients } = JSON.parse(event.body)

  const ingredients = getIngredientsHelper({ isCarnivore, numOfOptionalIngredients })

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingredients
    }),
    headers
  }
}
