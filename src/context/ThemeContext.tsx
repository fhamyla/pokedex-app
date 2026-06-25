import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors } from '../constants/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof DarkColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@pokedex_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('dark'); // Default to dark mode

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
        }
      } catch (e) {
        console.warn('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const colors = theme === 'dark' ? DarkColors : LightColors;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
