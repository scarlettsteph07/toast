# Toast API

An API to get avocado toast recipes

# Dev

```bash
serverless offline start
```

## Recipes

### Get new recipe ingredients:

```bash
http -v POST https://api.toastandavocado.xyz/v1/recipes X-User-Key:222 numOfOptionalIngredients:=5 requestedIngredients:='[]' ignoredIngredients:='[]' dietPreference=vegan
```

```bash
http -v POST http://localhost:3000/recipes X-User-Key:222 numOfOptionalIngredients:=5 requestedIngredients:='[]' ignoredIngredients:='[]' dietPreference=vegan
```

## Ingredients

### Get all ingredients by user

```bash
http -v GET https://api.toastandavocado.xyz/v1/ingredients  X-User-Key:222
```

```bash
http -v GET http://localhost:3000/ingredients  X-User-Key:222
```

### Add a New Ingredient

```bash
http -v POST https://api.toastandavocado.xyz/v1/ingredients/new X-User-Key:222 name=beer style:='["ipa", "lager"]' type:='["carnivore", "vegetarian", "vegan"]' required:=true
```

```bash
http -v POST http://localhost:3000/ingredients/new X-User-Key:222 name=beer style:='["ipa", "lager"]' type:='["carnivore", "vegetarian", "vegan"]' required:=true
```

### Update a Style from an Ingredient

```bash
http -v PUT https://api.toastandavocado.xyz/v1/ingredients/styles X-User-Key:222 name=beer currentStyle="ipa" style="india pale ale"

```

```bash
http -v PUT http://localhost:3000/ingredients/styles X-User-Key:222 name=beer currentStyle="ipa" style="india pale ale"
```

### Delete a Style from an Ingredient

```bash
http -v DELETE https://api.toastandavocado.xyz/v1/ingredientsX-User-Key:222 name=beer style=ipa

```

```bash
http -v DELETE http://localhost:3000/ingredients X-User-Key:222 name=beer style=ipa
```
