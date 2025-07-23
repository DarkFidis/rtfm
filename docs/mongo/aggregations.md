---
sidebar_position: 8
---

# Aggrégations

## Introduction

Les aggrégations permettent de rechercher une entrée après un enchaînement de plusieurs opérations. On appelle
cette suite d'opérations un pipeline d'aggrégations (__aggregation pipeline__). Chaque opération dudit pipeline
est une étape (__stage__)

### Syntaxe

Une aggrégation s'utilise comme suit : 

```javascript
db.collection.aggregate( [ { <ETAPE> }, ... ] );
```

La méthode `aggregate()` prend en paramètres un tableau d'étapes. Les étapes seront exécutées dans l'ordre dans
lequel elles sont dans le tableau. Chaque sortie d'une étape N est l'entrée de l'étape N+1

## Liste des Opérateurs

Il existe deux types d'opérateurs d'aggrégations : les opérateurs d'étapes et les opérateurs d'expression

### Opérateurs d'étapes

Parmi les opérateurs d'expression les plus utilisés : 

- `$count` retourne le nombre d'entrées à l'étape
- `$goNear` retourne les entrées les plus proches du point GeoJSON
- `$group` permet de grouper les entrées par rapport à un paramètre spécifié
- `$addFields` permet d'ajouter des champs aux documents
- `$limit` permet de transmettre N entrées à l'étape suivante
- `$match` filtre les entrées en fonction du paramètre spécifié
- `$merge` permet de fusionner le résultat dans une collection
- `$out` permet de remplacer le résultat dans une collection
- `$project` permet de modifier la structure des entrées (CRUD sur les champs)
- `$skip` permet de skip N documents avant de passer à l'étape suivante
- `$sort` permet de trier les entrées par rapport à un paramètre spécifié
- `$unwind` permet de déconstruire un tableau pour retourner un document par entrée
- `$lookup` permet de fetch d'autres entrées d'une autre collection en fonction d'un champ spécifié

### Opérateurs d'expression

#### Arithmétique

- `$add`
- `$substract`
- `$multiply`
- `$divide`
- `$round` pour arrondir un nombre
- `$ceil` pour arrondir au supérieur
- `$floor` pour arrondir à l'inférieur
- `$pow`
- `$exp`
- `$ln`
- `$log`
- `$mod` pour le modulo
- `$sqrt` pour la racine carrée

#### Arrays

- `$map`
- `$filter`
- `$size`
- `$reduce`
- `$slice`
- `$first`
- `$last`
- `$concatArray`
- `$arrayElemAt` retourne l'élement à la position spécifiée
- `$in` retourne true si l'élement spécifié est présent dans le tableau
- `$reverseArray` pour reverse le tableau

#### Booléens

- `$and`
- `$not`
- `$or`

#### Comparaisons

- `$eq` : retourne true si les valeurs sont égales
- `$ne` : retourne true si les valeurs ne sont pas égales
- `$lt` : inférieur à
- `$lte` : inférieur ou égal à
- `$gt` : supérieur à
- `$gte` : supérieur ou égal à
- `$cmp` : retourne 0 si les valeurs sont égales, 1 si la première valeur est supérieure ou -1 si inférieure

#### Dates

- `$toDate` convertit une valeur en date.
- `$month` retourne le mois de la date
- `$week` retourne la semaine de la date
- `$year` retourne l'année de la date

#### Strings

- `$toString`
- `$toUpper`
- `$toLower`
- `$dateFromString`
- `trim`
- `$ltrim` supprimes les espaces au début de la string
- `$rtrim` supprime les espaces à la fin de la string
- `$regexFind`
- `$regexFindAll`
- `$replaceOne`
- `$replaceAll`
- `$split`

#### Accumulations

- `$sum`
- `$avg`
- `$min`
- `$max`
- `$first`
- `$last`
- `$addToSet` ajoute les valeurs à un Set
- `$push` permet d'accumuler les valeurs dans un array

## Opérateurs d'étapes

### `$match`

`$match` permet de filter les entrées avant de les retourner à l'étape suivante

```javascript
db.collection.aggregate(
  [
    { $match : { field : 'value' } }
  ]
);
```

### `$sort`

```javascript
db.collection.aggregate(
  [
    { $sort : { field : 1 } }
  ]
);
```

Ici l'ordre peut être croissant (`1`) ou à l'inverse décroissant (`-1`)

### `$skip`

```javascript
db.collection.aggregate(
  [
    { $skip : 50 }
  ]
);
```

### `$limit`

```javascript
db.collection.aggregate(
  [
    { $limit : 100 }
  ]
);
```

> Le paramètre spécifié doit être un entier positif

### `$out`

`$out` permet de sauvegarder les entrées retournées dans une collection spécifiée. Si cette dernière existe déja, elle sera écrasée.

```javascript
db.collection.aggregate(
  [
    { $out : { db: 'dn_name', coll: 'collection_name' } }
  ]
);
```

> Doit obligatoirement être en dernier dans le pipeline

## Opérateurs de projection

### `$project`

L'opérateur `$project` permet de modifier les champs qui seront transmis à l'étape suivante

#### Inclure un champ

```javascript
db.movies.aggregate( [ { $project : { field: 1 } } ] )
```

On inclut le champ en mettant `1` comme valeur

#### Exclure un champ

```javascript
db.movies.aggregate( [ { $project : { field: 0 } } ] )
```

On exclut le champ en mettant `0` comme valeur

#### Créer un champ

On peut créer un champ en lui attribuant la valeur d'un autre champ

```javascript
db.movies.aggregate( [ { $project : { field: '$other_field' } } ] )
```

> Le fait de mettre `$` dans une valeur permet de faire référence à un champ de la collection

On peut même créer un array avec plusieurs champs : 

```javascript
db.movies.aggregate( [ { $project : { field:  ['$field_1', '$field_2'] } } ] )
```
 ou encore y insérer des valeurs calculées, comme dans cet exemple : 
 
```javascript
use('movie_db');

db.movies.aggregate([
  {
    $project: {
      averageRating: {
        $avg: [
          ['$imdb.rating',
          {$multiply: ['$viewer.rating', 2]}]
        ]
      }
    }
  },
])
```

### `$addFields`

Pour rajouter un nouveau champ : 

```javascript
db.movies.aggregate( [ { $addFields : { new_field: 'value' } } ]);
```

### `$add`

```javascript
db.collection.aggregate(
    [
        { $addFields: { total: { $add: [ "$field_1", "$field_2" ] } } }
    ]
);
```

### `$multiply`

```javascript
db.collection.aggregate(
    [
        { $addFields: { total: { $multiply: [ "$field_1", "$field_2" ] } } }
    ]
);
```

### `$divide`

```javascript
db.collection.aggregate(
    [
        { $addFields: { total: { $divide: [ "$field_1", 2 ] } } }
    ]
);
```

## Opérateurs d'arrays

### Lecture

#### `$arrayElemAt`

```javascript
db.collection.aggregate([
  { $addFields: { elemAtN: { $arrayElemAt: "$array", n } } }
])
```

#### `$first`

```javascript
db.collection.aggregate([
  { $addFields: { firstElem: { $first: "$array" } } }
])
```

#### Nombre d'élements

```javascript
db.collection.aggregate([
  { $project: { nbrOfElements: { $size: "$field"  } } }
]);
```

Même syntaxe pour `$last`

### Concaténation

```javascript
db.collection.aggregate([
  { $project: { concatenation: { $concatArrays: [ "$field1", "$field2" ] } } }
])
```

### Filtrage

```javascript
{ $filter: { input: '$array', as: 'alias', cond: 'condition' } }
```

Ici, `input` spécifie le tableau en entrée, `as` permet de donner un nom de variable à l'itération courante et 
enfin `cond` permet de spécifier la condition de filtrage. Si `as` n'est pas spécifié, alors l'alias par défaut est `$$this`.
Exemple : 

```javascript
{
  $addFields: {
    sold_books: {
      $filter: {
        input: "$items",
        cond: { $eq: ["$$this.category", "books"] }
      }
    }
  }
}
```

En cas d'utilisation d'un alias : 

```javascript
{
  $addFields: {
      sold_books: {
          $filter: {
            input: "$items",
            as: "item",
            cond: { $eq: ["$$item.category", "books"] }
          }
    }
  }
}
```

### Mapping

```javascript
{
  $addFields: {
    itemsWithNewPrice: {
      $map: {
        input: "$items", // Entrée
        as: "item", // Alias pour l'item courant
        in: { $add: ["$$item.price", 5] } // Transformation à exécuter
      }
    }
  }
}
```

### Reduce

```javascript
{
  $reduce: {
    input: '$items',
    initialValue: "",
    in: { $concat : ["$$value", "$$this"] }
  }
}
```

Ici, `$$value` désigne l'accumulateur et `$$this` l'item courant

### Slicing

```javascript
{ $slice: [ '$array', <position>, <n> ] }
```

## Opérateurs de strings

### `$toUpper`

```javascript
db.movies.aggregate(
    [
      {
        $project:
          {
            title: { $toUpper: "$title" },
          }
      }
    ]
)
```

Même syntaxe pour `$toLower`

### Concaténation

```javascript
db.movies.aggregate(
  [
    { $project: { movieDesc: { $concat: [ "$title", " - ", "$desc" ] } } }
  ]
)
```

## Opérateurs de date

### `toDate`

Un trick pour connaître la date de création d'un document est de convertir son ID en date : 

```javascript
use('sample_mflix');
db.collection.aggregate(
  [
    {
      $project: {
        creationDate: { $toDate: "$_id" },
      }
    }
  ]
);
```

## Opérateurs de conditions

### `$and`

Exemple : 

```javascript
use('movie_db');

db.movies.aggregate(
  [
    {
      $project: {
        title: 1,
        isGoodMovie: {
          $and: [
            {
              $gt: ["$imdb.rating", 8]
            },
            {
              $gt: ["viewer.rating", 4]
            }
          ]
        },
      }
    }
  ]
)
```

> Si la condition ne renvoie pas un booléen directement, alors sa valeur est convertie en fonction de truthy/falsy

### `$or`

```javascript
use('movie_db');

db.movies.aggregate(
  [
    {
      $project: {
        title: 1,
        isGoodMovie: {
          $or: [
            {
              $gt: ["$imdb.rating", 8]
            },
            {
              $gt: ["viewer.rating", 4]
            }
          ]
        },
      }
    }
  ]
)
```

### `$cond`

`$cond` permet de retourner une valeur si true ou une autre si false

```javascript
{ $cond: { if: <CONDITION>, then: 'value_if_true', else: 'value_if_false' } }
```

peut être raccourci : 

```javascript
{ $cond: { if: <CONDITION>, 'value_if_true', 'value_if_false' } }
```

### `$ifNull`

L'opérateur `$ifNull` retourne le premier paramètre si non-null ou le second si null

```javascript
db.users.aggregate(
  [
    {
        $project: {
          name: { $ifNull: [ "$name", "inconnu" ] }
        }
    }
  ]
)
```

### `$switch`

```javascript
use('movie_db');

db.movies.aggregate(
  [
    {
      $project: {
        _id: 0,
        title: 1,
        "imdb.rating": 1,
        qualite: {
            $switch:
            {
              branches: [
                {
                  case: { $gte : [ "$imdb.rating", 9 ] },
                  then: "Banger"
                },
                {
                  case: { $and : [ { $gte : [ "$imdb.rating", 7 ] },
                                  { $lt : [ "$imdb.rating", 9 ] } ] },
                  then: "Très bon"
                },
                {
                  case: { $gt : [ "$imdb.rating", 6 ] },
                  then: "Bon"
                }
              ],
              default: "Navet"
          }
        },
      }
    }
  ]
)
```

## Groupement

L'opérateur `$group` permet de grouper des élements en fonction d'un identifiant `_id` et de faire des opérations d'accumulation
sur un ou plusieurs champs spécifiés (comme ici `customers`) :

```javascript
use('supplies_db');

db.sales.aggregate(
  [
    {
      $group: {
        _id: { location: '$storeLocation', day: { $dayOfYear: "$saleDate"}, year: { $year: "$saleDate" } },
        customers: { $push:  "$customer" }
      }
    }
  ]
)
```

Si `_id: null` alors on ne fait pas de groupement et que l'accumulation se fera sur tous les documents. Cela arrive par exemple quand on veut compter le nombre d'entrées ou
bien de retourner les valeurs min et max d'un champ : 

```javascript
use('supplies_db');

db.sales.aggregate(
  [
    {
      $group: {
        _id: null,
        minCustomerAge: { $min: "$customer.age" },
        maxCustomerAge: { $max: "$customer.age" },
      }
    }
  ]
)
```

### Somme des valeurs d'un champ

Pour faire la somme des valeurs d'un champ donné : 

```javascript
use('supplies_db');

db.sales.aggregate(
  [
    {
      $group: {
        _id: { day: { $dayOfYear: "$saleDate"}, year: { $year: "$saleDate" } },
        numberOfSales: { $sum:  1 }
      }
    }
  ]
)
```

### Moyenne d'un champ

```javascript
use('supplies_db');

db.sales.aggregate(
  [
    {
      $group: {
        _id: { day: { $dayOfYear: "$saleDate"}, year: { $year: "$saleDate" } },
        avgSatisfaction: { $avg: "$customer.satisfaction" }
      }
    }
  ]
)
```

## `$unwind`

L'opérateur `$unwind` permet de spread un array contenu dans un champ et de le transformer en document, de façon
à pouvoir effectuer des groupements à l'étape suivante

### Syntaxe

```javascript
{
  $unwind: {
    path: '$array', // précise le champ à déconstruire
    includeArrayIndex: 'itemIndex', // précise le nom du champ dans lequel l'index est inséré
    preserveNullAndEmptyArrays: <booléen> // si true, unwind passera le doc même si le path est vide ou nul
  }
}
```

Exemple simple : 

```javascript
use('supplies_db');

db.sales.aggregate(
  [
    {
      $unwind: "$items"
    },
    {
      $group: {
        _id: "$_id",
        total: {
          $sum: { $multiply: [ "$items.price", "$items.quantity" ] }
        },
      }
    }
  ]
)
```

## `$lookup`

L'opérateur `$lookup` permet de récupérer les docs d'une autre collection

### Syntaxe

```javascript
{
  $lookup: {
    from: 'other_coll',
    localField: 'field_name',
    foreignField: 'other_coll_field_name',
    as: 'alias'
  }
}
```

### Exemple

Supposons qu'on ait une collection `users` ayant un champ `apiId` faisant référence à un champ `id` d'une collection `apis` :

```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "apis",
      localField: "apiId",
      foreignField: "id",
      as: "userApi"
    }
  }
])
```

Le résultat retourné sera le document `user` avec un champ supplémentaire `userApi` contenant le document `api` correspondant.

## `$geoNear`

L'opérateur `$geoNear` permet de trier les entrées par rapport à leur distance à un point spécifié. Cet opérateur
doit être obligatorement utilisé en premier dans un pipeline.

### Syntaxe

```javascript
db.restaurants.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [ 2.29449, 48.85823 ] }, // Point de référence, sous format GeoJSON
      distanceField: "distance.calculated", // nom de la distance calculée (obligatoire)
      maxDistance: 2000, 
        minDistance: 500,
      query: { category: "gastronomique" }, // ajoute un filtre pour limiter les sorties
      includeLocs: "distance.location",
    }
  }
])
```

## Bucket

### `$bucket`

L'opérateur `$bucket` permet de grouper des entrées dans plusieurs groupes délimités par un champ et des intervalles.
En sortie, chaque bucket aura un identifiant contenant la limite inférieure incluse de l'intervalle.

Exemple : 

```javascript
db.collection.aggregate( [
  {
    $bucket: {
      groupBy: "$anneeNaissance",
      boundaries: [ 1950, 1960, 1970, 1980, 1990 ], // spécifie les limites inférieures de chaque bucket
      default: "Autres", // spécifie l'identifiant pour le groupe par défaut
      output: { // spécifie les champs des items de chaque bucket
        "count": { $sum: 1 },
        "users" :
          {
            $push: {
              "name": { $concat: [ "$first_name", " ", "$last_name"] },
              "naissance": "$anneeNaissance"
            }
          }
      }
    }
  },
] )
```

### `$bucketAuto`

L'opérateur `$bucketAuto` permet de créer un nombre spécifié de buckets contenant un nombre égal de documents

```javascript
db.collection.aggregate(
  [
    {
      $unwind: "$items"
    },
    {
      $bucketAuto: {
        groupBy: "$items.price",
        buckets: 5,
      }
    },
  ]
)
```