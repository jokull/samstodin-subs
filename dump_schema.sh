#!/bin/bash

# Download the OpenAPI spec
curl -s "https://askell.is/api/swagger/swagger.json" > swagger.json

# Convert the JSON file with trailing commas to standard JSON format
pnpm dlx json5 swagger.json > converted_swagger.json

# Use jq to replace the incorrect "float" type with the correct "number" type and format
jq 'walk(if type == "object" and .type == "float" then .type = "number" | .format = "float" else . end)' converted_swagger.json > fixed_swagger.json

# Remove the original files and rename the fixed file
rm swagger.json converted_swagger.json
mv fixed_swagger.json swagger.json

# Create the zodios client
pnpm dlx openapi-zod-client swagger.json -o ./app/askell.ts

# Format
pnpm dlx prettier -w ./app/askell.ts
