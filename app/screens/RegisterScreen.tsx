// app/screens/RegisterScreen.tsx

import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/authContext';
import { BASE_URL } from '../config';
import axios from 'axios';

const RegisterScreen = ({ navigation }: any) => {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, credentials);

      if (response.status === 201) {
        // Registration successful, log the user in
        await login(credentials);
      } else {
        // Handle registration failure
        console.error('Registration failed:', response.data);
      }
    } catch (error) {
      // Handle error
      console.error('Registration error:', error);
    }
  };

  return (
    <View>
      {/* ...existing code... */}
    </View>
  );
};

export default RegisterScreen;