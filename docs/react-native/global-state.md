---
sidebar_position: 6
---

# Etat global (Store) d'une app

## Redux-Toolkit

### Setup

**Installation des packages** :

```shell
npx expo install @reduxjs/toolkit react-redux
```

**Création du store** : 

Dans un fichier `store.js` à la racine du projet : 

```js
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {},
})
```

Ensuite, il faut fournir le store à l'app via un provider. Donc, dans `App.js` : 

```jsx
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./navigator/StackNavigator";
import { Provider } from "react-redux";
import store from "./store/store.js";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </Provider>
  );
}
```

### Slices

#### Création

Prenons l'exemple d'un slice pour des TODOS, dans un fichier `slices/todos.js` : 

```jsx
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  todos: [],
};

export const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: (state, action) => {
      state.todos = [...state.todos, action.payload];
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter(
        (currentId) => currentId !== action.payload
      );
    },
  },
});

export const { addTodo, removeTodo } = favoritesSlice.actions;

export default todoSlice.reducer;
```

Remarques : 

- Les méthodes contenues dans `reducers` prennent par convention deux paramètres : le `state` (état courant) et `action`. `action` a deux propriétés : le type et `payload` qui contient
les paramètres qu'on passera aux méthodes.

Par la suite, il faut ajouter le slice à la configuration du store, dans `store.js` : 

```js
import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "./slices/todos";

const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
});

export default store;
```

#### Utilisation du slice

Pour lire les données du slice, on utilise le hook `useSelector`, pour mettre à jour les données du slice, on utilise `useDispatch`. Si on reprend notre exemple précédent : 

```jsx
import { useDispatch, useSelector } from "react-redux";
import { addTodo, removeTodo } from "../../store/slices/todosSlices";

const TodoDetails = ({ route, navigation }) => {
  const dispatch = useDispatch(); // Update du slice
  const favoritesIds = useSelector((state) => state.todos.todos); // Lecture du slice
  const isFavorite = favoritesIds.includes(route.params.id);

  const toggleFavoriteStatus = () => {
    if (isFavorite) {
      dispatch(removeTodo(route.params.id)); // Update du slice
    } else {
      dispatch(addTodo(route.params.id)); // Update du slice
    }
  };
```

### Debug

Pour débugger un store Redux, on peut utiliser Reactotron

#### Setup

**Installation**

```shell
npm i --save-dev reactotron-react-native reactotron-redux
```

**Configuration**

A la racine du projet, créer le fichier `Reactotron.config.js` : 

```js
import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";

const reactotron = Reactotron.configure()
    .use(reactotronRedux())
    .useReactNative()
    .connect();

export default reactotron;
```

Dans le fichier `App.js`, avant tous les imports, placer la ligne : 

```js
if (__DEV__) {
  require("./ReactotronConfig");
}
```

Ensuite, il faut connecter Reactotron au store Redux, dans `store.js` : 

```js
import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "./slices/todos";
import reactotron from "../ReactotronConfig";  // Import depuis le fichier de configuration

export const store = configureStore({
  reducer: {
      todos: todosReducer,
  },
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(reactotron.createEnhancer()), // Ajout de reactotron dans la propriéte enhancers de configureStore
});
```

> Il existe quelques alternatives à Redux, comme [Recoil](https://recoiljs.org/fr/), [Zustand](https://zustand-demo.pmnd.rs/) ou encore [Jotai](https://jotai.org/docs/utilities/storage)