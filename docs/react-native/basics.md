---
sidebar_position: 2
---

# Basics

## Composants

En React-Native, les composants sont compilés à la fois en UI native Android et en iOS. Ils sont les seuls à pouvoir afficher du contenu dans une application. Chacun d'entre eux a une
tâche précise, par exemple on ne peut pas écrire du texte en dehors d'un composant `Text`

[Liste des composants natifs](https://reactnative.dev/docs/components-and-apis)

## Layouts

### View

Le composant `View` est l'équivalent mobile de `div`

```jsx
import React from 'react';
import { View, Text } from 'react-native';

<View>
    <Text>Du texte</Text>
</View>
```

### Gérer le style

Il n'y a pas de CSS en React-Native, on utilise le composant `StyleSheet` pour créer et gérer le style d'une ou plusieurs `View`

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

<View style={[
    styles.container,
    {
        height: 100,
    }
]}>
    <Text>Du texte</Text>
</View>
```

Remarques : 

- Les propriétés de style s'écrivent en camelCase
- Il n'y a pas d'unité pour les tailles, si ce n'est les pourcentages

### Gérer la taille

On utilise très souvent FlexBox pour gérer la taille des composants. Exemple : 

```jsx
<View style={{ flex: 1 }}>
    <View
        style={{
          width: "100%",
          height: 350,
          flexDirection: "row",      // Ajout d'une direction horizontale
        }}
    >
        <View style={{ flex: 1, backgroundColor: "green" }}></View>
        <View style={{ flex: 1, backgroundColor: "red" }}></View>
    </View>
</View>
```

Ici, on définit deux blocs bleu et rouge de taille égale avec `flex: 1`, présent dans la vue parente et les deux vues enfant.

### ScrollView

Si le contenu de la main view dépasse la hauteur disponible de l'écran, il faut avoir une vue scrollable, c'est justement l'objectif du composant `ScrollView`

```jsx
<ScrollView style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          height: 350,
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1, backgroundColor: "green" }}></View>
        <View style={{ flex: 1, backgroundColor: "red" }}></View>
      </View>
</ScrollView>
```

### SafeAreaView

Sur iOS, l'app prend l'integralité de l'écran, y compris la partie ou il y a la batterie et le réseau. Pour remédier à ce cas, on a le composant `SafeAreaView`

```jsx
return (
   <SafeAreaView style={{ flex: 1 }}>
     <ScrollView>
         // Blocs...
     </ScrollView>
   </SafeAreaView>
 );
```

## Gestion des events

### Boutons

Pour intercepter l'équivalent du clic sur un bouton, on utilise le listener `onPress` sur le bouton

```jsx
<Button title="Valider" onPress={myFunction} />
```

### Inputs

L'équivalent mobile de `input` est le composant `TextInput` : 

```jsx
<TextInput value={myValue} onChangeText={setValue} />
```

`TextInput` a deux props importantes que sont `value` pour spécifier la valeur

## Listes

Il existe deux types de listes en React-Native : 

- Les *listes simples*, quand on connaît la taille du tableau et que celle-ci n'est pas trop élevée
- Les *flat lists*, quand le tableau est dynamique

```jsx
<FlatList
  data={array}   // Tableau sur lequel on veut itérer
  renderItem={({ item }) => {   // item est fourni par la FlatList. Il contient chacun des éléments du tableau
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.item}>{item}</Text>
      </View>
    );
  }}
/>
```

## Modales

Pour créer une modale, on utilise le composant `Modal` : 

```jsx
return (
    <Modal visible={isModalVisible} animationType="slide">
        // ...
    </Modal>
)
```

Deux props : 

- `visible` : pour gérer si oui ou non on affiche la modale
- `animationType`

> A utiliser avec un state, ici `isModalVisible`

## Images

### Image locale

```jsx
<Image
    style={styles.imageStyle}
    source={require('../path/to/image')}
/>
```

### Image en ligne

```jsx
<Image
    style={styles.imageStyle}
    source={{uri: 'https://image-url.png'}}
/>
```

### `resizeMode`

La prop `resizeMode` permet d'indiquer comment l'image sera redimensionnée dans la vue

```jsx
<Image
    style={styles.imageStyle}
    source={{uri: 'https://image-url.png'}}
    resizeMode="cover" // Default value
/>
```

[Valeurs possibles](https://reactnative.dev/docs/image#resizemode)

### KeyboardAvoidingView

Quand un utilisateur affiche le clavier, certaines parties de la vue seront masquées par ce dernier. Le composant `KeyboardAvoidingView` permet de redimensionner son contenu à l'affichage
du clavier, particulièrement utile si on a des inputs.

```jsx
<KeyboardAvoidingView>
    <Text>Du texte</Text>
</KeyboardAvoidingView>
```