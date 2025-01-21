---
sidebar_position: 4
---

# Design

## Fonts

[Doc Expo fonts](https://docs.expo.dev/versions/latest/sdk/font/)

Voici un mode d'emploi pour utiliser des polices custom : 

1. Créer un dossier `fonts` dans `assets` et y placer les fichier `.otf` et `.ttf`.
2. Installer la librairie `expo-font` qui permet à Expo de gérer les polices

```shell
npx expo install expo-font
```

3. Configurer le plugin `expo-font` en lui précisant le path des polices : 

```js
"plugins": [
  [
    "expo-font",
      {
        "fonts": [
          "./assets/fonts/Inter-Regular.ttf",
           "./assets/fonts/Inter-Bold.ttf"
         ]
       }
   ]
]
```

4. Utiliser le hook `useFonts` mis à disposition par `expo-font` : 

```js
import { useFonts } from 'expo-font';

const [fontLoaded] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
});
```

> `fontLoaded` est un booléen indiquant si la police est chargée ou non

5. Utiliser la police dans les styles : 

```jsx
<Text style={{ fontFamily: 'Inter-Bold', fontSize: 16 }}>Mon beau texte</Text>
```

> Ne pas oublier de vérifier si `fontLoaded` est à `true` avant de charger le composant : 
> ```jsx
> return fontLoaded ? (
>    <View style={styles.container}>
>        <StatusBar style="auto" />
>        <Text style={{ fontFamily: "Inter-Bold", fontSize: 16 }}>Mon beau texte</Text>
>    </View>
> ) : null;
> ```

## Icônes et SVG

### Icônes Expo

Expo met à disposition des icônes, disponibles [ici](https://icons.expo.fyi/Index). Elles sont utilisables comme suit : 

```jsx
import { AntDesign, Entypo } from "@expo/vector-icons";

<AntDesign name="exclamationcircle" size={32} color={colors.DARK} />
<Entypo name="circle-with-cross" size={32} color={colors.DARK} />
```

### SVG

Pour utiliser des SVG dans une app mobile, on peut le faire avec la librairie `react-native-svg-transformer` : 

1. Installation

```shell
npx expo install react-native-svg
npx expo install react-native-svg-transformer
```

2. Configuration

Créer un fichier `metro.config.js` à la racine du projet : 

```js
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
})();
```

3. Mise en place

Copier le contenu du fichier `.svg` dans un fichier à mettre dans `assets/icons`

4. Utilisation

```jsx
import MyIcon from "./assets/icons/myIcon.svg";

<MyIcon width={32} height={32} color={colors.GREY} />
```