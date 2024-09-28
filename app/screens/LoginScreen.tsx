// app/screens/LoginScreen.tsx

import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import { AuthContext } from '../contexts/authContext';

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
        <Text h3 style={styles.title}>
          Welcome Back
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
          placeholder="Password"
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
          title="Login"
          onPress={handleLogin}
          loading={loading}
          buttonStyle={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerLink}>Register here</Text>.
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
  title: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#2089dc', // Primary color
  },
  button: {
    backgroundColor: '#2089dc',
    marginTop: 20,
  },
  registerText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  registerLink: {
    color: '#2089dc',
    fontWeight: 'bold',
  },
});