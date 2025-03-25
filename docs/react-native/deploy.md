---
sidebar_position: 12
---

# Build et publication

## Limites d'Expo Go

Expo Go, dans son état actuel, n'a pas accès à toutes les APIs d'un smartphone, ce qui empêche l'utilisation de nombreuses fonctionnalités et modules parmi lesquels : 

- __In App Purchase__ pour faire des achats sur Apple Store ou Google Play
- Stripe
- Google Pay
- Le bluetooth
- Le SDK React-Native-Firebase
- Le streaming
- La réalité augmentée
- Fonctionnalités avancées des Maps, on ne peut pas afficher une map sur iOS par exemple

## Le Bare Workflow

Le workflow "bare" d'Expo offre davantage de marge de manoeuvre en termes de customisation d'une app. Il
offre notamment un accès au code natif et peut intégrer des modules jusqu-là inutilisables sur une app Expo Go.

Pour rappel, on créé une app en mode bare comme suit : 

```shell
npx create-expo-app --template bare-minimum <PROJECT_NAME>
```

On remarque quelques différences par rapport à un projet Expo Go : 

- Un fichier `index.js` à la racine du projet qui sert de point d'entrée pour l'app
- Dans le fichier `package.json`, le point d'entrée n'est plus geré par Expo, les scripts ne sont plus les mêmes.
- LE fichier de conf `app.json` est quasiment vide, on peut néammoins ajouter de la conf, voir [doc](https://docs.expo.dev/workflow/configuration/)
- Il y a des dossiers `android` et `ios` à la racine du projet

### Conversion Expo Go en Bare Workflow

Il est possible de générer un prebuild d'une app Expo Go en bare avec la commande suivante : 

```shell
npx expo prebuild
```

[Doc](https://docs.expo.dev/workflow/continuous-native-generation/)

### Run

#### Android

```shell
npx expo run:android
```

#### iOS

```shell
npx expo run:ios
```

#### Vidange du cache

Cela peut arriver que le hot-reload ne fonctionne pas correctement, dans ce cas, on regénère le build de la plateforme concernée.

```shell
npx expo prebuild --platform android --clean
```

### Librairies

Certaines librairies et SDKs peuvent necéssiter des configurations supplémentaires en mode bare, généralement une config pour chacune des plateformes (Android et iOS), il faut donc bien se référer à la doc des SDKs qu'on
utilise.

#### Librairies externes

Certaines librairies peuvent se configurer uniquement dans `app.json`, prenons l'exemple de `react-native-iap`, utilisable uniquement en mode bare :

```shell
npx expo install react-native-iap
```

puis dans `app.json` : 

```js
// ...
"plugins": [
  // ...,
  "react-native-iap"
],
```

Ensuite, on peut relancer un prebuild pour pouvoir l'utiliser.

### Le cas des icônes

Apple impose des règles strictes pour les icônes : 

- Le fichier doit être un PNG
- La taille de l'image doit être de 1024px x 1024px

[Doc](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/#app-icon)

## Lancer un build local sur un mobile

Voir [doc officielle](https://docs.expo.dev/get-started/set-up-your-environment/)

