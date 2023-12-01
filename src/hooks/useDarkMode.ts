import { useEffect, useState } from 'react';

const isSystemDarkMode = (): boolean => {
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useDarkMode = (): boolean => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const isDark = isSystemDarkMode();
    setIsDarkMode(isDark);
  }, []);

  return isDarkMode;
};
