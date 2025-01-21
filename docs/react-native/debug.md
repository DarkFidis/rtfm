---
sidebar_position: 3
---

# Debug

## Menu dev

Quand on lance un serveur Expo, un menu apparaît sur le mobile, c'est le menu dev. On y a accès par : 

- En pressant la touche `m`
- Sur iOs, `cmd` + `d`
- Sur Android, `Ctrl` + `m`, `cmd` + `m` sur Mac

Sur ce menu, on a les outils suivants : 

- `Reload` : permet de restart l'app pour que les derniers changements soient pris en compte
- `Disable Fast Refresh` : permet de toggle le mode watch de l'app
- `Open JS Debugger` : Ouvre une fenêtre de debug, dispo sur Chrome uniquement
- `Performance monitor` : Ouvre une fenêtre de métriques sur les perfs
- `Element inspector`

## Dev tools

### React Devtools

Comme en React, il n'y a pas de DOM, on ne peut pas inspecter directement les élements. C'est pourquoi on va utiliser un outil propre à React : React-devtools

```shell
# Installation
npm i -g react-devtools
# Lancement
react-devtools
```

Ainsi, on peut inspecter les composants React, les hooks, modifier les valeurs des states, etc.

### Reactotron

Reactotron est un outil de debug avancé permettant de : 

- Afficher les logs
- Afficher les requêtes réseau
- Débugger le state global d'une app (Redux)

#### Installation

[Doc React Native](https://docs.infinite.red/reactotron/quick-start/react-native/)
[Versions de Reactotron](https://github.com/infinitered/reactotron/releases?q=reactotron-app&expanded=true)

#### Configuration

Créer un fichier `ReactotronConfig.js` : 

```js
import Reactotron from "reactotron-react-native";
import { AsyncStorage } from "@react-native-async-storage/async-storage";

Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .connect();
```

Ensuite, dans `App.js` : 

```js
if (__DEV__) {  // __DEV__ est une variable globale Javascript, sera à false en production
  require("./ReactotronConfig");
}
```

#### Logs

```jsx
import reactotron from "reactotron-react-native";

export default function App() {
    reactotron.log("Running component App");
    // ...
}
```