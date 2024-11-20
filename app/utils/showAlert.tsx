import { Platform, Alert } from 'react-native';

export const showAlert = (title: string, message: string, options?:any) => {
  if (Platform.OS === 'web') {
    // Simulate Alert with window.alert
    window.alert(`${title}\n\n${message}`);
    // Handle callbacks manually for web
    if (options && options.length > 0 && options[0]?.onPress) {
      options[0].onPress(); // Execute the first option callback (e.g., "OK")
    }
  } else {
    Alert.alert(title, message, options, { cancelable: false });
  }
};