# Notes JavaScript

## Optimisation

### Déclaration de plusieurs variables

```javascript
let [var1, var2] = [value1, value2]
```

### Fonction conditionnelle

```javascript
if (condition) {
    func()
}
// peut s'écrire
conditon && func()
```

```javascript
if(myVar === 1) {
    method()
} else {
    method2()
}
// peut s'écrire
(myVar === 1 ? method : method2)()
```

Dans le cas d'un switch : 

```javascript
switch(data) {
    case 1:
        func1()
        break
    case 2:
        func2()
        break
    case 3:
        func3()
        break
}
// peut s'écrire
const cases = {
    1: func1,
    2: func2,
    3: func3,
}
cases[data] && cases[data]()
```

## console

### Log de variables

Pour logger plusieurs variables

```javascript
console.log({ foo, bar, baz })
// ou bien
console.table([foo, bar, baz])
```

### Log d'un objet complet

Pour logger un objet en profondeur : 

```javascript
console.dir(object, {
    depth: Infinity,
    colors: true,
})
```

### Styliser la console

```javascript
console.log('%c texte', 'style_css')
```

Exemple : 

```javascript
console.log("%cThis is a green text", "color:green");
```

### Logger la durée d'un process

```javascript
console.time('process_name')
// [...]
console.timeEnd('process_name')
```

## Promesses

### race & all

- `Promise.race()` prend un tableau de promesses et ne renvoie que le résultat de la promesse la plus rapide
- `Promise.all()` prend également un tableau de promesses et les exécute toutes en même temps. Elle renvoie un tableau contenant le résultat des promesses

> En cas d'échec d'une promesse, `Promise.all()` ne renverra que le résultat du rejet. Toutefois, toutes les autres promesses auront été exécutées.

### En série

Il existe plusieurs façons de lancer des promesses en série : 

1. Avec reduce

```javascript
function runInSeries(tasks) {
  return tasks.reduce((prevPromise, task) => {
    return prevPromise.then(() => task().then(result => {
      console.log(result);
    }));
  }, Promise.resolve());
}

const tasks = [
  () => Promise.resolve("Tâche 1 terminée"),
  () => new Promise(resolve => setTimeout(() => resolve("Tâche 2 terminée"), 1000)),
  () => Promise.resolve("Tâche 3 terminée")
];

runInSeries(tasks);
```

2. Avec une boucle for

```javascript
async function runInSeries(tasks) {
  for (const task of tasks) {
    const result = await task();
    console.log(result);
  }
}

const tasks = [
  () => Promise.resolve("Tâche 1 terminée"),
  () => new Promise(resolve => setTimeout(() => resolve("Tâche 2 terminée"), 1000)),
  () => Promise.resolve("Tâche 3 terminée")
];

runInSeries(tasks);
```

3. De manière récursive

```javascript
function runInSeries(tasks) {
  if (tasks.length === 0) return Promise.resolve();

  const [first, ...rest] = tasks;
  return first().then(result => {
    console.log(result);
    return runInSeries(rest);
  });
}
```

### eachAsync

````javascript
const eachAsync = async (array, iterator) => {
    await array.reduce((p, item, index, ar) => {
        p.then(async () => {
            await iterator(item, index, ar)
        })
    }, Promise.resolve())
}
````

## Tableaux

### Tableau de taille N

```javascript
Array.from(Array(N)).map((__, i) => i)
```

### Ajout avec le spread

Mode `push`

```javascript
const myArray = [...myArray, newValue]
```

Mode `shift`

```javascript
const myArray = [newValue, ...myArray]
```

## Strings

### Filtrage des accents

```javascript
const stringFilter = string => string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
```

## Numbers

### Puissances

```javascript
const bigNb = 1000000
// peut d'écrire
const bigNb = 1e6
```

## Dates

### Récupérer la timeZone du user

```javascript
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
```


### Récupérer la langue

```javascript
const userLang = navigator.language || navigator.userLanguage;
```

### Formattage

Enfin, le formattage avec les infos précédemment obtenues : 

```javascript
const formattedDate = date.toLocaleString(userLang, { timeZone: userTimeZone })
```

## Classes

### Enrichir une classe

```javascript
MyClass.prototype['myMethod'] = function () {
    // Logique
}
```

### Rendre privé un attribut

#### Syntaxe raccourcie

```javascript
class ClassWithPrivate {
  #privateField;
  #privateFieldWithInitializer = 42;

  #privateMethod() {
    // …
  }

  static #privateStaticField;
  static #privateStaticFieldWithInitializer = 42;

  static #privateStaticMethod() {
    // …
  }
}
```

#### WeakMap

Avec une `WeakMap` : 

```javascript
let wm = new WeakMap()

class Person {
    constructor(name, secret) {
        this.name = name
        const privateMap = { secret }
        wm.set(this, privateMap)
    }
    
    validatePassword(secret) {
        const privateMap = wm.get(this)
        return privateMap.secret === secret
    }
}

export default Person
```

### Rendre une classe immutable

```javascript
Object.freeze(MyClass.prototype)
```

Pour geler les propriétés : 

```javascript
Object.freeze(MyClass)
```



## Node

### Modules

Pour vérifier que l'on est sur le point d'entrée : 

```javascript
if (require.main === module) {
  void main()
}
```