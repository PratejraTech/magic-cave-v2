import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeModeContextValue {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const prefersDark = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('wonderland-dark-mode');
    if (stored !== null) {
      return stored === 'true';
    }
    return prefersDark();
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle('dark', isDarkMode);
    if (body) {
      body.classList.toggle('dark-mode', isDarkMode);
      body.classList.toggle('light-mode', !isDarkMode);
    }

    window.localStorage.setItem('wonderland-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem('wonderland-dark-mode');
      if (stored !== null) {
        // Respect explicit user toggle until they reset
        return;
      }
      setIsDarkMode(event.matches);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return <ThemeModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
};
