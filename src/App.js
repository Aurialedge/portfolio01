import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Console from './console/Console';
import useGitHubProjects from './hooks/useGitHubProjects';

// The pixel-town game is only downloaded when someone opens it.
const PlayMode = lazy(() => import('./game/PlayMode'));
const isPlayHash = () => typeof window !== 'undefined' && window.location.hash === '#play';

const GameLoading = () => (
  <div className="fixed inset-0 z-[55] grid place-items-center bg-[#1f3b1a] font-pixel text-xs text-amber-300">
    LOADING WORLD…
  </div>
);

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
  const [playing, setPlaying] = useState(isPlayHash);

  const returnHash = useRef('#gateway');

  // Open on #play, close when Back leaves #play.
  useEffect(() => {
    const onNav = () => setPlaying(isPlayHash());
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);

  const startPlay = useCallback(() => {
    if (!isPlayHash()) returnHash.current = window.location.hash || '#gateway';
    window.history.pushState(null, '', '#play');
    setPlaying(true);
  }, []);
  const exitPlay = useCallback(() => {
    setPlaying(false);
    window.history.replaceState(null, '', window.location.pathname + window.location.search + returnHash.current);
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
    <>
      <Console github={github} darkMode={darkMode} toggleTheme={toggleTheme} onPlay={startPlay} />
      {playing && (
        <Suspense fallback={<GameLoading />}>
          <PlayMode github={github} onExit={exitPlay} />
        </Suspense>
      )}
    </>
  );
};

export default App;
