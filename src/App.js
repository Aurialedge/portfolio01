import React, { useCallback, useEffect, useState } from 'react';
import Console from './console/Console';
import useGitHubProjects from './hooks/useGitHubProjects';

function initialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
  } catch {
    /* storage unavailable */
  }
  return true; // dark by default
}

const App = () => {
  const [darkMode, setDarkMode] = useState(initialTheme);
  const github = useGitHubProjects();
  const toggleTheme = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }, [darkMode]);

  return <Console github={github} darkMode={darkMode} toggleTheme={toggleTheme} />;
};

export default App;
