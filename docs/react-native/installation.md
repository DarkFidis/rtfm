---
sidebar_position: 1
---

# Installation

## Création de projet

### Avec Expo

Expo est un framework de développement mobile pour React-Native.

*Avantages* : 

- Permet de commencer rapidement le développement sans avoir à se soucier de la config pour tel appareil ni des dépendances du code natif
- Nombreuses librairies et APIs à disposition pour gérer diverses fonctionnalités
- Le build est géré automatiquement
- Gère les versions des librairies automatiquement

*Inconvénients* : 

- L'accès à certains modules natifs est restreint, ce qui limite l'utilisation de fonctionnalités bas-niveau du téléphone par exemple.
- Les apps sont généralement plus lourdes que celles développées sur React-Native-CLI

Pour créer une application : 

```shell
npx create-expo-app --template blank <PROJECT_NAME>

cd <PROJECT_NAME>
npx expo start
```

> Lors du démarrage de l'app, un QR code à scanner avec l'appli Expo est affiché dans la console pour pouvoir synchroniser avec son mobile.

### Avec React-Native-CLI

React-Native-CLI est la manière standard de développer des apps mobiles

*Avantages* : 

- Le build est configurable, ce qui peut permettre des optimisations custom
- On peut intégrer n'importe quel module natif, sans limitations

*Inconvénients* : 

- Le fait de gérer nous-même la conf de build peut-être pénible si on est junior
- Nécessite plus d'installations et de configuration initiales, ce qui peut s'avérer compliqué si on ne connaît pas le dev mobile
- Un Mac est nécessaire pour les tests et le déploiement de l'app en iOS

Pour créer une application : 

```shell
npx react-native@latest init <PROJECT_NAME>
cd <PROJECT_NAME>
npm start
```

Puis dans un autre terminal : 

```shell
npm run ios
# ou bien
npm run android
```

### Expo bare-workflow

En temps normal, quand on créé une app avec Expo, cette dernière est en "managed workflow" avec les limitations qu'on a vu. Néammoins, il est possible de créer une app en "bare workflow",
c-à-d avec les mêmes avantages qu'un projet lancé avec React-Native-CLI : 

```shell
npx create-expo-app --template bare-minimum
```

> Dans un projet Expo, il est possible de changer de workflow à tout moment. Cependant, on ne peut pas convertir un projet React-Native-CLI en Expo.

