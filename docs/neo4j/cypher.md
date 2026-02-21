# Language Cypher

[Manuel officiel](https://neo4j.com/docs/cypher-manual/current/queries/concepts/)

## Concepts de base

### Nodes

Dans Neo4J, on appelle noeuds ou __Nodes__ les principales entités. Pour fetcher un node, on procède comme suit : 

```
MATCH (n:Person {name:'John'})
RETURN n.born AS birthYear
```

Dans cet exemple, on a  : 

- Une variable `n` qui référence les nodes qui matchent la requête
- Un label `Person` qui sert à différencier les nodes entre eux. Chaque node a un ou plusieurs labels
- Une propriété `name` qui, dans cet exemple, désigne tous les nodes `Person` ayant une propriété `name` ayant pour valeur `John`

### Relations

Les nodes peuvent être reliés entre eux par des __relations__. Une relation doit avoir un node de départ, un node d'arrivée et ne doit avoir
qu'un seul type. Dans une requête, une relation est définie par une flèche à l'intérieur duquel on insère les propriétés de ladite relation (Syntaxe : `-[]->`) : 

```
MATCH (:Person {name: 'John'})-[r:KNOWS WHERE r.since < 2006]->(friend:Person)
RETURN count(r) As numberOfFriends
```

Dans cet exemple, on recherche des relations `r` de type `KNOWS` avec une propriété `since` dont la valeur est inférieure à `2006` et qui relie le node
`John` à n'importe quel autre node `Person`

### Paths

Dans Neo4J, un __path__ ou chemin, désigne le chemin, dans le graphe, d'un node à un autre node. Exemple : 

```
MATCH p = shortestPath(
  (:Person {name: 'John'})-[:KNOWS*]-(:Person {nationality: 'Canadian'})
)
RETURN p
```

Dans cet exemple, on recherche le chemin le plus court (fonction `shortestPath`) entre le node `John` et le node de nationalité canadienne le plus proche
dans le graphe

## Queries

### Nodes

Pour trouver un node : 

```
MATCH (var:Label {prop:'value'})
RETURN var.props AS result
```

Pour limiter les résultats à `n` entrées : 

```
MATCH (var:Label)
RETURN var
LIMIT n
```

On peut également trier le résultat : 

```
MATCH (var:Label)
WHERE var.prop >= 5 AND var.prop < 10
RETURN var.prop AS result
ORDER BY prop DESC
```

### Relations

Pour trouver des nodes ayant une relation spécifique avec un node d'entrée : 

```
MATCH (nodeFrom:Label {prop: 'Value'})<-[relation:RELATION_TYPE]-(nodeTo:Label)
RETURN nodeTo.prop AS result
```

ou bien les nodes ayant une relation qui n'est pas de type `RELATION_TYPE`, avec un `!` inséré juste avant le type : 

```
MATCH (nodeFrom:Label {prop: 'Value'})<-[relation:!RELATION_TYPE]-(nodeTo:Label)
RETURN nodeTo.prop AS result
```

Si on souhaite récupérer le type des relations en supplément : 

```
MATCH (nodeFrom:Label {prop: 'Value'})<-[relation:RELATION_TYPE]-(nodeTo:Label)
RETURN nodeTo.prop AS result, type(relation) AS relationType 
```

### Paths

Pour 

```
MATCH (varFrom:Label {prop:'Value'})--(varTo:Label)
RETURN DISTINCT varTo.prop1 AS result1, varTo.prop2 AS result2
ORDER BY prop1, name
LIMIT 5
```