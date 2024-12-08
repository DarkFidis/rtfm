# Notes GraphQL

## Création d'un Scalar custom

```javascript
const customScalar = new GraphQLScalarType({
    name: '<SCALAR_NAME>',
    description: '<SCALAR_DESC>',
    parseLiteral: parseLiteralMethod,  // retourne les infos concernant l'AST
    parseValue: parseValueMethod,  // traite la valeur envoyée par le client
    serialize: serializeMethod,  // traite la valeur qui sera envoyée au client
})
```

Exemples de méthodes : 

```javascript
function parseLiteralMethod(ast) {
    if (ast.kind === Kind.STRING) {
        return ast.value
    }
}

function parseValueMethod(value) {
    return value
}

function serializeMethod(value) {
    return value
}
```

> Si codegen est utilisé, ne pas oublier de rajouter le scalaire dans la config `codegen.yml`