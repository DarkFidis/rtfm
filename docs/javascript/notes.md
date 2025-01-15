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

