import React, { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ThemeContext } from '../App';
import { profile } from '../data/profile';
import { GamepadIcon } from './Icons';

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

function useActiveSection() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-lg p-2 text-muted transition-colors hover:bg-raised hover:text-ink"
      aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-line bg-bg/80 backdrop-blur-lg' : 'border-b border-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-mono text-xs text-bg">
            {profile.initials}
          </span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                active === id ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {label}
              {active === id && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-px h-px bg-accent" />}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <a
            href="#play"
            className="mr-1 inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
            title="Explore the portfolio as a game"
          >
            <GamepadIcon className="h-4 w-4" />
            Play
          </a>
          <ThemeToggle />
          <a href={profile.resume} download className="btn-primary ml-1 hidden !py-2 sm:inline-flex">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Resume
          </a>
          <button
            className="rounded-lg p-2 text-muted hover:bg-raised hover:text-ink md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="container-page flex flex-col gap-1 pb-4">
              {NAV.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm ${active === id ? 'bg-raised text-ink' : 'text-muted'}`}
                >
                  {label}
                </a>
              ))}
              <a href={profile.resume} download className="btn-primary mt-2">
                <ArrowDownTrayIcon className="h-4 w-4" /> Download resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
