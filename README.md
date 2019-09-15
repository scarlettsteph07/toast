# Serverless Framework Enterprise Template

This template is designed to help you get started with the [Serverless Framework Enterprise](https://github.com/serverless/enterprise). If you are unsure how to use this template, click [here for instructions](https://github.com/serverless/enterprise/blob/master/docs/getting-started.md#deploy-an-example-service) that will walk you through the steps required to deploy a service to the Serverless Framework Enterprise using this template.

# Ingredients

## Get all ingredients by user

```
http -v GET https://rc0my683o8.execute-api.us-east-1.amazonaws.com/production/ingredients X-User-Key:222
```

```
http -v GET https://api.toastandavocado.xyz/v1/ingredients  X-User-Key:222
```

```
http -v GET http://localhost:3000/ingredients  X-User-Key:222
```

# Add a New Ingredient

```
http -v POST https://rc0my683o8.execute-api.us-east-1.amazonaws.com/production/ingredients/new X-User-Key:222 name=beer style:='["ipa", "lager"]' type:='["carnivore", "vegetarian", "vegan"]' required:=true
```

```
http -v POST https://api.toastandavocado.xyz/v1/ingredients/new X-User-Key:222 name=beer style:='["ipa", "lager"]' type:='["carnivore", "vegetarian", "vegan"]' required:=true
```

```
http -v POST http://localhost:3000/ingredients/new X-User-Key:222 name=beer style:='["ipa", "lager"]' type:='["carnivore", "vegetarian", "vegan"]' required:=true
```

# Delete a Style from an Ingredient

```
http -v DELETE https://rc0my683o8.execute-api.us-east-1.amazonaws.com/production/ingredients X-User-Key:222 name=beer style=ipa
```

```
curl -X DELETE "https://api.toastandavocado.xyz/v1/ingredients" --data '{"name": "xxx", "style": "mxxxxxx"}' X-User-Key: 222 | jq .
```

```
curl -X DELETE "http://localhost:3000/ingredients" --data '{"name": "xxx", "style": "mxxxxxx"}' X-User-Key: 222 | jq .
```

# Recipes

# Get new recipe ingredients:

```
http -v POST https://rc0my683o8.execute-api.us-east-1.amazonaws.com/production/recipes X-User-Key:22 numOfOptionalIngredients:=5 requestedIngredients:='[]' ignoredIngredients:='[]' dietPreference=vegan
```

```
http -v POST https://api.toastandavocado.xyz/v1/recipes X-User-Key:22 numOfOptionalIngredients:=5 requestedIngredients:='[]' ignoredIngredients:='[]' dietPreference=vegan
```

```
http -v POST http://localhost:3000/recipes X-User-Key:22 numOfOptionalIngredients:=5 requestedIngredients:='[]' ignoredIngredients:='[]' dietPreference=vegan
```
