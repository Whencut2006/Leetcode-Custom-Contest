import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Read params strictly from the URL context mapped by content.js
  const getInitialParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      theme: searchParams.get('theme') || 'dark',
      username: searchParams.get('user') || 'Anonymous'
    };
  };

  const [params] = useState(getInitialParams());

  return (
    <ThemeContext.Provider value={{ theme: params.theme, username: params.username }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be utilized strictly within a ThemeProvider wrapper');
  }
  return context;
}