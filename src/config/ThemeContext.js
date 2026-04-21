import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '~/styles/colors';

const THEME_KEY = '@app_theme';

const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark') {
        setIsDark(true);
      }
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  };

  const themeColors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors: themeColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
