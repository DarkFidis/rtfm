---
sidebar_position: 5
---

# Routing

## React-Navigation

### Setup

Installation des librairies : 

```shell
npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
```

Pour l'utilisation, il faut englober tout le code de l'app dans un composant `NavigationContainer` fourni par `@react-navigation/native` : 

```jsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
        /* Code de l'app */
    </NavigationContainer>
  );
}
```

Il existe plusieurs types de navigation : 

- Menus en bas de l'écran
- Menus en haut de l'écran
- Menus à tiroir
- Menus qui permettent de naviguer entre les écrans, les `StackNavigator`

### `StackNavigator`

#### Installation

```shell
npx expo install @react-navigation/native-stack
```

#### Mise en place

Exemple d'utilisation : 

```jsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenOne from "./screens/ScreenOne";
import ScreenTwo from "./screens/ScreenTwo";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen component={ScreenOne} name="ScreenOne" />
        <Stack.Screen component={ScreenTwo} name="ScreenTwo" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### Navigation

Dans le fichier `screens/ScreenOne.jsx` : 

```jsx
export default function ScreenOne(props) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        props.navigation.navigate("ScreenTwo");
      }}
    >
      <Text>Ecran 1</Text>
    </Pressable>
  );
}
```

La prop `props.navigation.navigate` prend en paramètre le `name` de l'écran cible spécifié dans le composant `Stack.Screen` défini dans `App.jsx`

#### Options

##### Style du navigateur

On peut styliser le navigateur grâce aux options disponibles dans le namespace `screenOptions` : 

```jsx
<Stack.Navigator
  screenOptions={{
    headerShadowVisible: false,
    headerTitleAlign: "center",
    headerStyle: {
      backgroundColor: "#e6e8f5",
    },
    headerTitleStyle: {
      color: "blue",
    },
  }}
>
```

Il est possible d'ajouter des élements dans la partie gauche du navigateur (`headerLeft`) et la partie droite (`headerRight`) comme ceci : 

```jsx
<Stack.Screen
  component={ScreenTwo}
  name="ScreenTwo"
  options={({ navigation }) => {
    return {
      title: "Profile",
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()}>
          <AntDesign name="leftcircle" size={24} color="black" />
        </Pressable>
      ),
    };
  }}
/>
```

> `navigation.goBack()` permet de revenir à l'écran précédent

#### Paramètres 

On peut passer des paramètres dans la navigation : 

```jsx
headerRight: () => (
  <Pressable
    onPress={() =>
      navigation.navigate("ScreenTwo", {
        name: "John",
      })
    }
  >
    <AntDesign name="user" size={24} color="black" />
  </Pressable>
)
```

que l'on peut récupérer ensuite dans le composant `ScreenTwo` : 

```jsx
export default function ScreenTwo({ route }) {
  const { name } = route.params;
  return (
    <Pressable style={styles.container} onPress={() => {}}>
      <Text>Hello {name}</Text>
    </Pressable>
  );
}
```

### Bottom Tabs Navigator

#### Installation

```shell
npx expo install @react-navigation/bottom-tabs
```

#### Mise en place

```jsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen component={HomeScreen} name="Home" />
      <Tab.Screen component={SettingsScreen} name="Settings" />
    </Tab.Navigator>
  );
}
```

Dans le composant `App` : 

```jsx
import { NavigationContainer } from "@react-navigation/native";
import BottomTabsNavigator from "./navigtors/BottomTabsNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabsNavigator />
    </NavigationContainer>
  );
}
```

#### Stylisation

Le composant `Tab.Screen`, tout comme `Stack.Screen` expose une propriété `screenOptions` avec des sous-props qui lui sont propres : 

- `title` : titre en haut de l'écran et dans la navigation
- `headerTitleAlign` : alignement du titre en haut de l'écran
- `headerStyle` : style du header
- `headerTitleStyle` : style du titre
- `tabBarLabel` : label du menu de navigation
- `tabBarLabelStyle` : style du label dans le menu de navigation
- `tabBarIcon` : fonction retournant un composant icône
- `tabBarStyle` : style du menu de navigation
- `tabBarActiveTintColor` : couleur de l'icône et du label de l'onglet actif
- `tabBarInactiveTintColor` : couleur de l'icône et du label de l'onglet inactif
- `tabBarActiveBackgroundColor` : couleur de fond de l'onglet actif
- `tabBarInactiveBackgroundColor` : couleur de fond de l'onglet inactif
- `tabBarShowLabel` : affiche ou pas le label dans les projets

[Liste des props](https://reactnavigation.org/docs/bottom-tab-navigator/#options)

#### Navigation

Pour naviguer entre les écrans, on utilise la méthode `jumpTo`, qui accepte également des paramètres : 

```jsx
import { Pressable, StyleSheet, Text } from "react-native";

export default function HomeScreen(props) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        props.navigation.jumpTo("Settings", { name: "john" });
      }}
    >
      <Text>Screen 1</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ...
});
```

qu'on récupère ensuite : 

```jsx
import { Pressable, StyleSheet, Text } from "react-native";

export default function SettingsScreen({ route }) {
  const { name } = route.params;
  return (
    <Pressable style={styles.container}>
      <Text>Settings {name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
...
});
```

### Le Top Tabs Navigator

Le Top Tabs Navigator est très similaire au Bottom Tabs Navigator. Il permet de créér un navigateur en haut de l'écran et offre la possibilité de naviguer sans avoir recours aux méthodes
attitrées.

#### Installation

```shell
npx expo install @react-navigation/material-top-tabs@^6.x react-native-tab-view@^3.x
npx expo install react-native-pager-view
```

#### Mise en place

```jsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Screen4 from "../screens/ScreenOne";
import Screen5 from "../screens/ScreenTwo";

const Tabs = createMaterialTopTabNavigator();
export default function TopTabsNavigator() {
    const inset = useSafeAreaInsets()
    return (
        <Tabs.Navigator
            screenOptions={{
                tabBarStyle: {
                    paddingTop: inset.top,
                },
            }}
        >
          <Tabs.Screen component={ScreenOne} name="Article 1" />
          <Tabs.Screen component={ScreenTwo} name="Article 2" />
        </Tabs.Navigator>
    );
}
```

### Drawer Navigator

Le Drawer Navigator est un navigateur "togglable" situé sur le côté de l'écran

#### Installation

```shell
npx expo install @react-navigation/drawer@^6.x
```

Pour faire fonctionner cette navigation, il faut installer et configurer deux librairies pour l'animation : 

```shell
npx expo install react-native-gesture-handler react-native-reanimated
```

La librairie `react-native-reanimated` doit être configurée dans `babel.config.js` : 

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],  // Ajouter cette ligne
  };
};
```

#### Mise en place

Dans un fichier `navigators/DrawerNavigator.js` : 

```jsx
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList,
    createDrawerNavigator,
} from "@react-navigation/drawer";
import { Pressable } from "react-native";

import Screen1 from "../screens/Screen1";
import Screen2 from "../screens/Screen2";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Group
                screenOptions={({ navigation }) => ({
                    headerTitleAlign: "center", // Permet de centrer les titres 
                    drawerActiveTintColor: "blue", // background + texte en bleu si l'item est actif
                    drawerInactiveTintColor: "grey", // texte en gris si l'item est inactif
                    headerLeft: () => (
                        <Pressable
                            style={{ marginLeft: 16 }}
                            onPress={() => navigation.openDrawer()}
                        >
                            <AntDesign name="menu-fold" size={24} color="black" />
                        </Pressable>
                    ),
                    swipeEdgeWidth: 100, // Distance (en px) du bord de l'écran permettant d'activer le balayage
                    swipeMinDistance: 20, // Distance (en px) minimum du balayage permettant d'activer l'ouverture du menu
                    overlayColor: "rgba(0,0,255,0.5)",
                })}
            >
                <Drawer.Screen
                    component={Screen1}
                    name="Home"
                    options={({ navigation }) => ({
                        drawerLabel: "Home",
                        drawerIcon: ({ color }) => (
                            <AntDesign name="home" size={24} color={color} /> // Icône pour l'item dans le menu
                        ),
                        headerRight: () => (
                            <Pressable
                                style={{ marginRight: 16 }}
                                onPress={() =>
                                    navigation.navigate("Screen2", {
                                        name: "john",
                                    })
                                }
                            >
                                <AntDesign name="user" size={24} color="black" />
                            </Pressable>
                        ),
                    })}
                />
                <Drawer.Screen
                    component={Screen2}
                    name="Notifications"
                    options={{
                        drawerIcon: ({ color }) => (
                            <Ionicons name="notifications" size={24} color={color} />
                        ),
                    }}
                />
            </Drawer.Group>
        </Drawer.Navigator>
    );
}

function CustomDrawerContent(props) {
    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem
                label="Logout"
                onPress={() => console.log("logout")}
                icon={() => <MaterialIcons name="logout" size={24} color="black" />}
            />
        </DrawerContentScrollView>
    );
}
```

### Nesting de navigateurs

Il est possible et même très simple de nester des navigateurs. En temps normal, on associe un screen à un composant comme ici : 

```jsx
const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {

    return (
        <Tab.Navigator>
            <Tab.Screen
                component={SomeScreenComponent}
                name="Home"
            />
        </Tab.Navigator>
    )
}
```

Il suffit simplement de remplacer le composant (ici `SomeScreenComponent`) par un navigateur.

> L'ordre d'imbrication des navigateurs n'a pas d'importance, cela varie en fonction du design souhaité.

## Expo-Router

Expo-Router est le routeur mis à disposition par Expo. Développé à partir de React-Navigation, il est en grande partie inspiré de Next.js

[Doc officielle](https://docs.expo.dev/router/introduction/)

### Setup

A l'initialisation du projet avec Expo, installer les dépendances nécéssaires : 

```shell
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

Dans `package.json`, il faut modifier la propriété `main` : 

```js
{
    //...
  "main": "expo-router/entry",
    // ...
}
```

Dans le fichier de conf de l'app (`app.json`), ajouter la propriété `scheme` :

```js
{
  "scheme": "<APP_NAME>",
}
```

Si vous avez une conf Babel, dans `babel.config.js` : 

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

Enfin, restart l'app en nettoyant le cache au passage : 

```shell
npx expo start -c
```

### Structure

Dans un projet avec Expo-Router, le routing se base sur le folder `app` dans lequel seront les fichiers relatifs à chaque route. Ainsi, le fichier `app/index.tsx` sera celui servi sur
la route principale `/`

### Navigation

Pour naviguer d'une page à l'autre dans l'app, Expo-Router fournit le composant `Link` : 

```jsx
// ...
import { Link } from "expo-router";

export default function Page() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'application</Text>
      <Link href="/home">
        <Text>Accueil</Text>
      </Link>
    </View>
  );
}
// ...
```

### Layouts

#### Création

Pour créer un layout, il faut créer un fichier `app/_layout.js` (**le nom est obligatoire**) : 

```jsx
import { Slot } from "expo-router";

export default function MyRootLayout() {
    return <Slot />;
}
```

Le composant `Slot` est nécessaire à Expo pour que le routing et la navigation soient opérationnelles.

> Il est possible, et même fréquent, de créer plusieurs layouts dans une app, un par sous-route (sous-dossier de `app`). C'est pourquoi une bonne pratique à adopter est de créer un
> fichier `main` dans lequel on met `index.js` ou `home.js`


### Routes dynamiques

#### Création

Pour créer une route dynamique, avec un paramètre `param` à utiliser, il faut créer un fichier `app/[param].js` : 

```jsx
import { useLocalSearchParams } from "expo-router"
// ...

export default function ParamDetails() {
  const { param } = useLocalSearchParams() // Récupération du paramètre
  return (
    <View style={styles.container}>
      // ...
      <Text style={styles.title}>{param}</Text>
      // ...
    )
}
```

#### Navigation

Le composant `Link`, et plus précisément la prop `href` de ce dernier permet de transmettre les paramètres de manière plus propre : 

```jsx
<Link
  href={{
    pathname: "/dynamic-route/[params]",
    params: { params: JSON.stringify(["value1", "value2", "value3"]) },
  }}
  style={styles.link}
>
```

### Le Stack

#### Mise en place

```jsx
import { Stack } from "expo-router"
// ...
export default function MyLayout() {
  return <Stack />
}
```

#### Définition des screens

```jsx
// ...
<Stack
  screenOptions={{
  //  Options de style du navigateur
  }}
>
  <Stack.Screen name="index" options={{ title: "Articles" }} />
    <Stack.Screen name="[id]" />
  <Stack.Screen
    name="favorites/[ids]"
    options={{ title: "Articles Favoris" }}
  />
</Stack>
// ...
```

Usecase : Si on souhaite configurer le titre d'une route dynamique comme par exemple `[param].js`, il est conseillé de le configurer dans le screen directement comme suit : 

```jsx
import { Stack } from "expo-router"
// ...

export default function MyDynamicPage() {
  const { param } = useLocalSearchParams()
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Article: " + param,
        }}
      />
      <Text style={styles.title}>Param</Text>
    )
}
```

#### Navigation avec useRouter

Pour naviguer entre les screens, on utilise le hook `useRouter` de `expo-router` : 

```jsx
import { useRouter } from "expo-router"
import { TouchableOpacity } from "react-native"
// ...

export default function MyDynamicPage() {
  // ...
  const router = useRouter()
  return (
      <Text style={styles.title}>{param}</Text>
      <TouchableOpacity style={styles.link} onPress={() => router.back()}>
        <Text style={styles.text}>Revenir en arrière</Text>
      </TouchableOpacity>
    </View>
  )
}
// ...
```

Notez que la méthode `back()` de `router` permet de revenir à l'écran précédent, peut importe celui-ci. Si on souhaite revenir plutôt vers la page principale du stack, on utilisera
la méthode `dismissAll()` : 

```jsx
import { useRouter } from "expo-router"
import { TouchableOpacity } from "react-native"
// ...

export default function MyDynamicPage() {
  // ...
  const router = useRouter()
  return (
      <Text style={styles.title}>{param}</Text>
      <TouchableOpacity style={styles.link} onPress={() => router.dismissAll()}>
        <Text style={styles.text}>Revenir vers la main page</Text>
      </TouchableOpacity>
    </View>
  )
}
// ...
```

Dans le cas ou on a une Stack avec un grand nombre de pages, on peut être amené à revenir sur un écran en particulier, ce qui est possible avec la méthode `dismiss(n)`. Cette méthode
prend un paramètre `n` de type number qui indique qu'il faut remonter de `n` pages dans l'arborescence de la Stack.

```jsx
export default function MyDynamicPage() {
  const { param, dismissCount } = useLocalSearchParams()
  // ...
  return (
      <TouchableOpacity
        style={styles.link}
        onPress={() => {
          router.dismiss(dismissCount)
        }}
      >
    )
}
```

> Si `n` est plus grand que le nombre de screens de la Stack, on reviendra à la main page

Le paramètre `n` est appelé `dismissCount`, il est configurable notamment dans l'objet `href` du composant `Link` : 

```jsx
<Link
  href={{
    pathname: "/page/[param]",
    params: { param: "foo", dismissCount: 2 },
  }}
  style={styles.link}
>
```

### Tabs

#### Mise en place

Les fichiers relatifs au navigateur Tabs doivent être placés dans un dossier `(tabs)`. Dans un fichier `(tabs)/_layout.js`, on va déclarer notre navigateur `Tabs` : 

```jsx
import { Tabs } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { colors } from "../../constants/colors"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.light,
        tabBarStyle: {
          backgroundColor: colors.dark,
          height: 80,
          paddingTop: 6,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
        headerTintColor: colors.light,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.dark,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Réglages",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "À propos",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="question" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
```

Ensuite, il faut déclarer le Tabs dans le layout principal de l'application : 

```jsx
import { Stack } from "expo-router"

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
```

### Drawer

#### Mise en place

Les fichiers relatifs au navigateur Tabs doivent être placés dans un dossier `(drawer)`. Dans un fichier `(drawer)/_layout.js`, on va déclarer notre navigateur `Drawer` : 

```jsx
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Drawer } from "expo-router/drawer"

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer />
    </GestureHandlerRootView>
  )
}
```

> Le composant `GestureHandlerRootView` permet l'ouverture et la fermeture du Drawer par balayage.

Ensuite, dans le layout principal : 

```jsx
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    </Stack>
  )
}
```

Pour configurer les screens dynamiques, on peut, tout comme la Stack, le faire dans le screen lui-même : 

```jsx
import Drawer from "expo-router/drawer"

export default function MyDynamicPage() {
  return (
    <View style={styles.container}>
      <Drawer.Screen
        options={{
          headerTitleStyle: {
            color: colors.primary,
          },
          title: "Dynamic title",
        }}
      />
    )
}
```

### Nesting de navigateurs

> TODO avec la pratique

### Top Tabs

[Doc officielle](https://reactnavigation.org/docs/material-top-tab-navigator/)

#### Installation

```shell
npx expo install @react-navigation/material-top-tabs
npx expo install react-native-pager-view
```

> TODO avec la pratique









