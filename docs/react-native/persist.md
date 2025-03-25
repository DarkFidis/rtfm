---
sidebar_position: 10
---

# Persistance

## SQLite

### Installation

```shell
npx expo install expo-sqlite
```

### Création d'une base

```js
import * as SQLite from 'expo-sqlite'
// ...
export const db = SQLite.openDatabaseSync('<DB_NAME>')
```

### Requête

Pour exécuter une requête

```js
await db.execAsync('SQL REQUEST')
```

Pour fetcher des données

```js
const data = await db.getAllAsync('SELECT * FROM table')
```

Pour les opérations de create, update et delete : 

```js
const result = await db.runAsync('INSERT INTO table ...')
// result.lastInsertRowId renvoie l'ID de la nouvelle entrée
```

### Inspection

Pour inspecter la base SQLite, on va utiliser le module `expo-drizzle-studio-plugin`

```shell
npx expo install expo-drizzle-studio-plugin
```

Dans le code : 

```js
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
// ...
useDrizzleStudio(db)
```