# Serverless Framework Enterprise Template
This template is designed to help you get started with the [Serverless Framework Enterprise](https://github.com/serverless/enterprise).  If you are unsure how to use this template, click [here for instructions](https://github.com/serverless/enterprise/blob/master/docs/getting-started.md#deploy-an-example-service) that will walk you through the steps required to deploy a service to the Serverless Framework Enterprise using this template.


# Get ingredient list
```
curl -X POST http://localhost:3000/ingredients --data '{"dietType": "vegetarian", "numOfOptionalIngredients": 5, "requestedIngredients": [], "ignoredIngredients": [], "dietPreference": "vegan"}' --header ""X-User-Key: 34444" | jq .
```

# Delete a Style from an Ingredient
```
curl -X DELETE "http://localhost:3000/ingredients" --data '{"name": "xxx", "style": "mxxxxxx"}' --header 'X-User-Key: 34444'
```

# Add a New Ingredient
```
curl -X POST --header 'X-User-Key: 34444' --data '{"name": "xxx", "style": ["mxxxxxx"], "type": ["carnivore", "vegan"],"required": true}' "http://localhost:3000/ingredients/new"
```