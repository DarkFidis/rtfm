---
sidebar_position: 7
---

# Formulaires

## Inputs

### text

Pour les inputs de type texte, il y a le composant `<TextInput />` ([doc officielle](https://reactnative.dev/docs/textinput)). Parmi les props utiles : 

- `maxLength` : spécifie une taille max pour l'entrée
- `autoCorrect`
- `multiline`

### Date picker

*Installation* : 

```shell
npx expo install react-native-modal-datetime-picker @react-native-community/datetimepicker
```

*Configuration* : 

Dans le fichier `app.json`, ajouter la ligne suivante : 

```json
{
  "expo": {
    "userInterfaceStyle": "automatic",
     // ...
  }
}
```

*Exemple d'utilisation* : 

```jsx
import { useState } from "react";
import { Button, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export const DateTimePicker = () => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  return (
    <View>
      <Button title="Show Date Picker" onPress={showDatePicker} />
        <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode={mode}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minuteInterval={15}
            locale="fr-FR"
            minimumDate={new Date(2024,0,1)}
            maximumDate={new Date(2040, 11, 31)}
            display="spinner"
            cancelTextIOS="Annuler"
            confirmTextIOS="Valider"
            date={new Date(dateTime)}
        />
    </View>
  );
};
```

### radio

Pour les inputs de type radio-box, il y a le composant `<Switch />` ([Doc officielle](https://reactnative.dev/docs/switch))

