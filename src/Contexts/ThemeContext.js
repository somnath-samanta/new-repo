import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('isDarkTheme');
        if (storedTheme !== null) {
          setIsDarkTheme(JSON.parse(storedTheme));
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme;
      setIsDarkTheme(newTheme);
      await AsyncStorage.setItem('isDarkTheme', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
