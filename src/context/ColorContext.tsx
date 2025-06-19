"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ColorSettings = {
  timelineColor: string;
  activityBoxBackground: string;
  activityBoxText: string;
  pageBackground: string;
  modalBackground: string;
  formBackground: string;
};

export type ThemePreset = {
  name: string;
  colors: ColorSettings;
  icon: string;
};

const themes: ThemePreset[] = [
  {
    name: 'Light',
    icon: '☀️',
    colors: {
      timelineColor: '#E5E7EB',
      activityBoxBackground: '#FFFFFF',
      activityBoxText: '#1F2937',
      pageBackground: '#F9FAFB',
      modalBackground: '#FFFFFF',
      formBackground: '#FFFFFF',
    }
  },
  {
    name: 'Dark',
    icon: '🌙',
    colors: {
      timelineColor: '#374151',
      activityBoxBackground: '#1F2937',
      activityBoxText: '#F9FAFB',
      pageBackground: '#111827',
      modalBackground: '#1F2937',
      formBackground: '#1F2937',
    }
  },
  {
    name: 'Nature',
    icon: '🌿',
    colors: {
      timelineColor: '#84cc16',
      activityBoxBackground: '#f0fdf4',
      activityBoxText: '#166534',
      pageBackground: '#ecfdf5',
      modalBackground: '#f0fdf4',
      formBackground: '#f0fdf4',
    }
  },
  {
    name: 'Ocean',
    icon: '🌊',
    colors: {
      timelineColor: '#0ea5e9',
      activityBoxBackground: '#f0f9ff',
      activityBoxText: '#075985',
      pageBackground: '#e0f2fe',
      modalBackground: '#f0f9ff',
      formBackground: '#f0f9ff',
    }
  },
  {
    name: 'Sunset',
    icon: '🌅',
    colors: {
      timelineColor: '#f97316',
      activityBoxBackground: '#fff7ed',
      activityBoxText: '#9a3412',
      pageBackground: '#ffedd5',
      modalBackground: '#fff7ed',
      formBackground: '#fff7ed',
    }
  }
];

const CUSTOM_THEMES_KEY = 'timelineCustomThemes';
const CURRENT_THEME_KEY = 'timelineCurrentTheme';
const COLOR_SETTINGS_KEY = 'timelineColorSettings';

type ColorContextType = {
  colors: ColorSettings;
  setColors: (colors: ColorSettings) => void;
  currentTheme: string;
  setCurrentTheme: (themeName: string) => void;
  availableThemes: ThemePreset[];
  saveCustomTheme: (name: string) => void;
  deleteCustomTheme: (name: string) => void;
  resetToTheme: (themeName?: string) => void;
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  // Initialize custom themes from localStorage
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CUSTOM_THEMES_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Combine built-in and custom themes
  const availableThemes = [...themes, ...customThemes];

  // Initialize current theme from localStorage or default to 'Light'
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CURRENT_THEME_KEY);
      return saved || 'Light';
    }
    return 'Light';
  });

  // Initialize colors from localStorage or default to current theme colors
  const [colors, setColors] = useState<ColorSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(COLOR_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
      const theme = availableThemes.find(t => t.name === currentTheme);
      return theme ? theme.colors : themes[0].colors;
    }
    return themes[0].colors;
  });

  // Save custom themes to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
  }, [customThemes]);

  // Save current theme to localStorage
  useEffect(() => {
    localStorage.setItem(CURRENT_THEME_KEY, currentTheme);
  }, [currentTheme]);

  // Save colors to localStorage
  useEffect(() => {
    localStorage.setItem(COLOR_SETTINGS_KEY, JSON.stringify(colors));
  }, [colors]);

  const saveCustomTheme = (name: string) => {
    const newTheme: ThemePreset = {
      name,
      icon: '💫',
      colors: { ...colors }
    };
    setCustomThemes([...customThemes, newTheme]);
    setCurrentTheme(name);
  };

  const deleteCustomTheme = (name: string) => {
    setCustomThemes(customThemes.filter(theme => theme.name !== name));
    if (currentTheme === name) {
      setCurrentTheme('Light');
      resetToTheme('Light');
    }
  };

  const resetToTheme = (themeName?: string) => {
    const targetTheme = availableThemes.find(t => t.name === (themeName || currentTheme));
    if (targetTheme) {
      setColors(targetTheme.colors);
    }
  };

  return (
    <ColorContext.Provider value={{
      colors,
      setColors,
      currentTheme,
      setCurrentTheme,
      availableThemes,
      saveCustomTheme,
      deleteCustomTheme,
      resetToTheme,
    }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
} 