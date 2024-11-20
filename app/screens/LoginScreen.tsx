// app/screens/LoginScreen.tsx

import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image, // Import Image component
} from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import { AuthContext } from '../contexts/authContext'
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    // Input validation
    if (!credentials.identifier || !credentials.password) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(credentials);
    } catch (error) {
      alert('Login failed. Please check your credentials and try again.');
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
          TodoCopilot
        </Text>

        <Input
          placeholder="Email or Username"
          leftIcon={{ type: 'material', name: 'person' }}
          value={credentials.identifier}
          onChangeText={(text) => setCredentials({ ...credentials, identifier: text })}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
        />

        <Input
          placeholder="Contrasena"
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
          title="Iniciar Sesión"
          onPress={handleLogin}
          loading={loading}
          buttonStyle={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
          ¿No tienes cuenta?
            <Text style={styles.registerLink}>Registrate aquí</Text>.
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  registerText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  registerLink: {
    color: '#FF6101',
  },
});