// app/screens/RegisterScreen.tsx

import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import { AuthContext } from '../contexts/authContext'; // Ensure correct import path
import { Dimensions } from 'react-native';
import { Alert } from 'react-native';
import { showAlert } from '../utils/showAlert';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => { // Ensure navigation is received via props
  const { register } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRegister = async () => {
    // Input validation
    if (!credentials.username || !credentials.email || !credentials.password) {
      showAlert('Error', 'Por favor, completa todos los campos.');
      return;
    }
  
    setLoading(true);
    try {
      const result = await register(credentials);
      if (result.success) {
        showAlert(
          'Éxito',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to LoginScreen after 3 seconds
                setTimeout(() => {
                  navigation.navigate('Login');
                }, 3000);
              },
            },
          ]
        );
      } else {
        showAlert('Error', result.message);
      }
    } catch (error) {
      showAlert('Error', 'Registro fallido. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.innerContainer}>
        {/* Add the Logo Image */}
        <Image
          source={require('../../assets/LogoPng/Original.png')} // Update the path to your logo image
          style={styles.logo}
          resizeMode="contain"
        />

        <Text h3 style={styles.title}>
          Registrate en TodoCopilot
        </Text>

        <Input
          placeholder="Nombre de Usuario"
          leftIcon={{ type: 'material', name: 'person' }}
          value={credentials.username}
          onChangeText={(text) => setCredentials({ ...credentials, username: text })}
          autoCapitalize="none"
          textContentType="username"
        />

        <Input
          placeholder="Email"
          leftIcon={{ type: 'material', name: 'email' }}
          value={credentials.email}
          onChangeText={(text) => setCredentials({ ...credentials, email: text })}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Input
          placeholder="Contraseña"
          leftIcon={{ type: 'material', name: 'lock' }}
          rightIcon={{
            type: 'material',
            name: passwordVisible ? 'visibility-off' : 'visibility',
            onPress: () => setPasswordVisible(!passwordVisible),
          }}
          secureTextEntry={!passwordVisible}
          value={credentials.password}
          onChangeText={(text) => setCredentials({ ...credentials, password: text })}
          autoCapitalize="none"
          textContentType="password"
        />

        <Button
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
          buttonStyle={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            ¿Ya tienes una cuenta?{' '}
            <Text style={styles.loginLink}>Inicia sesión aquí</Text>.
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff', // Ensure white background for web
  },
  logo: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    alignSelf: 'center',
    marginBottom: 20, // Space between logo and title
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#FF6101', // Primary color
  },
  button: {
    backgroundColor: '#FF6101',
    marginTop: 20,
    borderRadius: 20,
    alignSelf: 'center',
    width: width * 0.6, // 60% of the screen width
  },
  loginText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  loginLink: {
    color: '#FF6101',
  },
});