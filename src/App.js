import React, { createContext, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import Experience from './sections/Experience';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Achievements from './sections/Achievements';
import Contact from './sections/Contact';
import useGitHubProjects from './hooks/useGitHubProjects';

export const ThemeContext = createContext({ darkMode: true, toggleDarkMode: () => {} });

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode: () => setDarkMode((d) => !d) }}>
      <Navbar />
      <main id="top">
        <Hero github={github} />
        <About />
        <Experience />
        <Projects github={github} />
        <Skills languages={github.languages} />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </ThemeContext.Provider>
  );
};

export default App;
