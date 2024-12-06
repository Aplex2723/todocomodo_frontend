// App.tsx

import React, { useContext, useState, createContext, useEffect } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './app/navigation/RootNavigator';
import { ApiKeyContextProvider } from './app/contexts/apiKeyContext';
import { AuthContextProvider, AuthContext } from './app/contexts/authContext';
import AuthNavigator from './app/navigation/AuthNavigation';
import { lightColors, darkColors } from './app/utils/colors';
import { getItem, setItem } from './app/utils/storage'; // Import storage helpers

interface ThemeContextProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors; 
}

export const ThemeContext = createContext<ThemeContextProps>({
  isDarkTheme: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export default function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadThemePreference = async () => {
      const savedTheme = await getItem('theme'); // Retrieve stored theme: 'dark' or 'light'
      if (savedTheme === 'dark') {
        setIsDarkTheme(true);
      } else if (savedTheme === 'light') {
        setIsDarkTheme(false);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    setIsDarkTheme(prev => {
      const newThemeValue = !prev;
      setItem('theme', newThemeValue ? 'dark' : 'light');
      return newThemeValue;
    });
  };

  const colors = isDarkTheme ? darkColors : lightColors;

  return (
    <AuthContextProvider>
      <ApiKeyContextProvider>
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, colors }}>
          <RootSiblingParent>
            <StatusBar style={isDarkTheme ? "light" : "dark"} />
            <NavigationContainer>
              <MainNavigator />
            </NavigationContainer>
          </RootSiblingParent>
        </ThemeContext.Provider>
      </ApiKeyContextProvider>
    </AuthContextProvider>
  );
}

function MainNavigator() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <RootNavigator /> : <AuthNavigator />;
}