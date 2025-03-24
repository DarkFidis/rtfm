---
sidebar_position: 8
---

# SDKS

Les SDKS permettent d'ajouter des fonctionnalités spéciales à une application comme une maps, une base de données et plein d'autres choses. [Doc officielle SDKs](https://docs.expo.dev/versions/latest/) disponible dans
le menu à gauche

## Maps

### MapView

MapView est un module permettant d'utiliser Google Maps dans une application. [Doc officielle](https://github.com/react-native-maps/react-native-maps)

> Une configuration est nécéssaire si on veut déployer une app avec ce SDK, infos [ici](https://docs.expo.dev/versions/latest/sdk/map-view/#deploy-app-with-google-maps)

#### Installation

```shell
npx expo install react-native-maps
```

#### Création d'une map

Exemple de composant `Maps` : 

```jsx
import { StyleSheet } from "react-native";
import MapView from "react-native-maps";

export default function Map() {
    const initialRegion = {
        latitude: 43.8765,
        longitude: 2.712,
        latitudeDelta: 10,
        longitudeDelta: 4,
    }
    return <MapView initialRegion={initialRegion} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
```

#### Marker

Pour ajouter un marqueur sur la map : 

```jsx
<Marker
    coordinate={{
        latitude: 43.288,
        longitude: 5.3522,
    }}
    draggable
    isPreselected
>
    /* Contenu custom */
</Marker>
```

Props : 

- `draggable` : permet de déplacer le marqueur si on maintient le press > 0.5 sec
- `isPreselected` : permet de pouvoir déplacer le marqueur sans avoir à cliquer dessus sur iOS
- `stopPropagation` : à true, permet de ne pas déclencher le handler `onPress` de la map si on presse le marqueur

### Localisation

#### Installation

```shell
npx expo install expo-location
```

Puis configurer dans `app.json` :

```js
{
  "expo": {
    //...
    "plugins": [
        [
            "expo-location",
            {
                "locationAlwaysAndWhenInUsePermission": "Autoriser l'application à utiliser la localisation",  // iOS
                "isAndroidBackgroundLocationEnabled": true  // Android
            }
        ]
    ]
  }
}
```

#### Autorisation & Utilisation

```js
import { useEffect, useState } from "react"
import * as Location from "expo-location";

export default function Map() {
    // ...
    const [locationStatus, requestLocationPermission] = Location.useForegroundPermissions();

    const getUserLocation = async () => {
        let status = locationStatus;
        if (!status?.granted) {
            status = await requestLocationPermission();
        }
        if (status?.granted) {
            const position = await Location.getCurrentPositionAsync();
            console.log(position)
        }
    };
    useEffect(() => {
        getUserLocation();
    }, [])
}
  // ...
```

## Photos

### ImagePicker

[Doc officielle](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

#### Installation

```shell
npx expo install expo-image-picker
```

Puis configurer dans `app.json` : 

```js
{
  "expo": {
    //...
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "L'application accède à vos photos pour les afficher sur la map"
        }
      ]
    ]
  }
}
```
#### Galerie

##### Permission

Dans le composant ou on l'utilise : 

```js
import * as ImagePicker from 'expo-image-picker'

// ...

const [libraryStatus, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions()

const useImagePicker = async () => {
    const autorisation = libraryStatus
    if (!autorisation?.granted) {
        await requestLibraryPermission()
    }
    if (autorisation.granted) {
        // Utilisation ...
    }
}
```

Dans le fichier de config `app.json` :

```js
[
  "expo-image-picker",
  {
    "photosPermission": "L'application accède à la galerie du mobile"
  }
],
```

##### Utilisation

Pour charger une image depuis sa galerie :

```js
const image = await ImagePicker.launchImageLibraryAsync({
    quality: 0.5
})
```

A la fin du chargement, la variable image est un objet contenant deux clés : `assets`  et `canceled`. Si on n'a pas sélectionné d'image, alors `assets` est `null` et `canceled: true`.
Inversement, si on a une image alors `assets` contient les infos de cette image et `canceled: false`

#### Appareil photo

##### Permission

Pour avoir accès à l'appareil photo du mobile, on demande la permission caméra. Dans le composant ou on l'utilise :

```js
import * as ImagePicker from 'expo-image-picker'

// ...

const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions()

const useImagePicker = async () => {
    const autorisation = cameraStatus
    if (!autorisation?.granted) {
        await requestCameraPermission()
    }
    if (autorisation.granted) {
        // Utilisation ...
    }
}
```

Dans le fichier de config `app.json` : 

```js
[
  "expo-image-picker",
  {
    "photosPermission": "L'application accède à la galerie du mobile",
    "cameraPermission" : "L'application accède à votre appareil photo du mobile"
  }
],
```

##### Utilisation

Pour charger une image depuis sa galerie :

```js
const image = await ImagePicker.launchCameraAsync()
```

Comme pour la galerie, la variable `image` est un objet contenant deux clés : `assets`  et `canceled`, le fonctionnement est le même.

#### Sauvegarde de photos

##### Installation

```shell
npx expo install expo-media-library
```

##### Permission

Dans le fichier de config `app.json` :

```js
// ...
[
    "expo-media-library",
    {
        "savePhotosPermission": "Permettre à l'application d'enregistrer des photos dans la galerie"
    }
]
// ...
```

```js
import * as MediaLibrary from 'expo-media-library'

// ...

const [libraryStatus, requestLibraryPermission] = MediaLibrary.usePermissions({ granularPermissions: 'photo' })

const useImagePicker = async () => {
    const autorisation = libraryStatus
    if (!autorisation?.granted) {
        await requestLibraryPermission()
    }
    if (autorisation.granted) {
        // Utilisation ...
    }
}
```

##### Utilisation

Pour charger une image depuis sa galerie :

```js
await MediaLibrary.saveToLibraryAsync('<IMAGE_URI>')
```

## Ecran

### Orientation

Pour gérer l'orientation de l'écran, on peut utiliser `expo-screen-orientation`

#### Setup

*Installation*

```shell
npx expo install expo-screen-orientation
```

*Configuration* : Dans le fichier `app.json` : 

```js
// ...
[
    "expo-screen-orientation",
    {
        "initialOrientation": "PORTRAIT_UP"
    }
]
// ...
```

#### Utilisation

```js
import * as ScreenOrientation from "expo-screen-orientation";
```

Le SDK `ScreenOrientation` met à disposition les propriétés suivantes : 

- `getOrientationAsync()` renvoie l'orientation de l'écran
- `unlockAsync()` permet de définir l'orientation en mode portrait ou paysage quand l'app est déverrouillée
- `lockAsync()` permet de définir l'orientation en mode portrait ou paysage quand l'app est verrouillée
- `OrientationLock` est un énum de toutes les orientations possibles

> L'orientation `portrait-upside-down` ne marche ni sur Android ni sur iOS