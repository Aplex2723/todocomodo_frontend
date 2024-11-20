// App.tsx

import React, { useContext, useState } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './app/navigation/RootNavigator';
import { ApiKeyContextProvider } from './app/contexts/apiKeyContext';
import { AuthContextProvider, AuthContext } from './app/contexts/authContext';
import AuthNavigator from './app/navigation/AuthNavigation';
import SplashScreen from './app/screens/SplashScreen';

export default function App() {
  // const [isLoading, setIsLoading] = useState(true);

  // const handleSplashFinish = () => {
  //   setIsLoading(false);
  // };

  // if (isLoading) {
  //   return <SplashScreen onFinish={handleSplashFinish} />;
  // }

  return (
    <AuthContextProvider>
      <ApiKeyContextProvider>
        <RootSiblingParent>
          <StatusBar style="light" />
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </RootSiblingParent>
      </ApiKeyContextProvider>
    </AuthContextProvider>
  );
}

function MainNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? <RootNavigator /> : <AuthNavigator />;
}