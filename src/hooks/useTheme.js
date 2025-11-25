// src/hooks/useTheme.js
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'agenda_theme';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const themeRoot = dark
    ? 'bg-slate-900 text-slate-100'
    : 'bg-white text-gray-900';

  const themeCard = dark
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-gray-200';

  const themeMuted = dark ? 'text-slate-300' : 'text-gray-600';
  const themeHead = dark ? 'bg-slate-800' : 'bg-gray-50';

  return {
    dark,
    setDark,
    themeRoot,
    themeCard,
    themeMuted,
    themeHead,
  };
}
