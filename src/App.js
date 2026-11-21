import React, { createContext, lazy, Suspense, useCallback, useEffect, useState } from 'react';
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

// The game is only downloaded when someone opens Play mode.
const PlayMode = lazy(() => import('./game/PlayMode'));

const isPlayHash = () => typeof window !== 'undefined' && window.location.hash === '#play';

const GameLoading = () => (
  <div className="fixed inset-0 z-[55] grid place-items-center bg-[#1f3b1a] font-pixel text-xs text-amber-300">
    LOADING WORLD…
  </div>
);

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
  const [playing, setPlaying] = useState(isPlayHash);

  useEffect(() => {
    const onHash = () => isPlayHash() && setPlaying(true);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const exitPlay = useCallback(() => {
    setPlaying(false);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

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
      {playing && (
        <Suspense fallback={<GameLoading />}>
          <PlayMode github={github} onExit={exitPlay} />
        </Suspense>
      )}
    </ThemeContext.Provider>
  );
};

export default App;
