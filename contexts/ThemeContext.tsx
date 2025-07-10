import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '@/utils/storage';

interface ThemeContextData {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    border: string;
  };
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const lightTheme = {
  primary: '#4A90E2',
  secondary: '#50C878',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#333333',
  textSecondary: '#666666',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  border: '#E0E0E0',
};

const darkTheme = {
  primary: '#5BA3F5',
  secondary: '#5ED882',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  border: '#333333',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await Storage.getSettings();
      setIsDarkMode(settings.darkMode || false);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await Storage.saveSettings({ darkMode: newMode });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};