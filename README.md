# Serverless Framework Enterprise Template

This template is designed to help you get started with the [Serverless Framework Enterprise](https://github.com/serverless/enterprise). If you are unsure how to use this template, click [here for instructions](https://github.com/serverless/enterprise/blob/master/docs/getting-started.md#deploy-an-example-service) that will walk you through the steps required to deploy a service to the Serverless Framework Enterprise using this template.

# Get ingredient list

```
curl -X POST https://api.toastandavocado.xyz/v1/ingredients --data '{"dietType": "vegetarian", "numOfOptionalIngredients": 5, "requestedIngredients": [], "ignoredIngredients": [], "dietPreference": "vegan"}' --header "X-User-Key: 1234" | jq .
```

```
curl -X POST localhost:3000/ingredients --data '{"dietType": "vegetarian", "numOfOptionalIngredients": 5, "requestedIngredients": [], "ignoredIngredients": [], "dietPreference": "vegan"}' --header "X-User-Key: 1234" | jq .
```

# Delete a Style from an Ingredient

```
curl -X DELETE "https://api.toastandavocado.xyz/v1/ingredients" --data '{"name": "xxx", "style": "mxxxxxx"}' --header 'X-User-Key: 1234' | jq .
```

```
curl -X DELETE "http://localhost:3000/ingredients" --data '{"name": "xxx", "style": "mxxxxxx"}' --header 'X-User-Key: 1234' | jq .
```

# Add a New Ingredient

```
curl -X POST "https://api.toastandavocado.xyz/v1/ingredients/new" --header 'X-User-Key: 1234' --data '{"name": "avocado", "style": ["avocado", "rotten avocado"], "type": ["carnivore", "vegetarian", "vegan"],"required": true}'  | jq .
```

```
curl -X POST "http://localhost:3000/ingredients/new" --header 'X-User-Key: 1234' --data '{"name": "avocado", "style": ["avocado", "rotten avocado"], "type": ["carnivore", "vegetarian", "vegan"],"required": true}' | jq .
```

# Get new recipe ingredients:

```
http -v POST https://api.toastandavocado.xyz/v1/recipes X-User-Key:1234 numOfOptionalIngredients:=5 requestedIngredients:='[]' ignoredIngredients:='[]' dietPreference=vegan
```

```
curl -X POST http://localhost:3000/recipes  --header "X-User-Key: 1234" --data '{"numOfOptionalIngredients": 5, "requestedIngredients": [], "ignoredIngredients": [], "dietPreference": "vegan"}'
```

## Get all user ingredients

```
curl -X GET https://api.toastandavocado.xyz/v1/ingredients  --header "X-User-Key: 1234"
```

```
curl -X GET http://localhost:3000/ingredients  --header "X-User-Key: 1234"
```
