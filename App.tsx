import { RootSiblingParent } from 'react-native-root-siblings';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './app/navigation/RootNavigator';
import { ApiKeyContextProvider } from './app/contexts/apiKeyContext';
import { AuthContextProvider, AuthContext } from './app/contexts/authContext';
// import AuthNavigator from './app/navigation/AuthNavigator';
import React, { useContext } from 'react';
import LoadingScreen from './app/screens/LoadingScreen';
import LoginScreen from './app/screens/LoginScreen';

export default function App() {
  return (
    <AuthContextProvider>
      <ApiKeyContextProvider>
        <RootSiblingParent>
          <StatusBar style="light" />
          <MainNavigator />
        </RootSiblingParent>
      </ApiKeyContextProvider>
    </AuthContextProvider>
  );
}

function MainNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? <RootNavigator /> : <LoginScreen/>;
}