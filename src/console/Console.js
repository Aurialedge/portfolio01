import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CubeTransparentIcon,
  EnvelopeIcon,
  MoonIcon,
  SunIcon,
  TrophyIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { profile } from '../data/profile';
import { GamepadIcon } from '../components/Icons';
import { BY_ID, NODES, ORDER, resolveNode, routeBetween } from './topology';
import { COMMANDS, parse } from './commands';
import TopologyMap, { HOP_SECONDS } from './TopologyMap';
import { CommandLine, EventLog, fmtClock } from './EventLog';
import { NextHop } from './views/common';
import ProfileView from './views/ProfileView';
import ExperienceView from './views/ExperienceView';
import ProjectsView from './views/ProjectsView';
import SkillsView from './views/SkillsView';
import AwardsView from './views/AwardsView';
import ContactView from './views/ContactView';

const STORE_KEY = 'shivraj.sys';
const LOG_LIMIT = 200;
const DOCK_ICONS = {
  gateway: UserCircleIcon,
  experience: BriefcaseIcon,
  projects: CubeTransparentIcon,
  skills: WrenchScrewdriverIcon,
  awards: TrophyIcon,
  contact: EnvelopeIcon,
};

const isChaosHash = () => typeof window !== 'undefined' && window.location.hash === '#chaos';
const hashNode = () =>
  typeof window === 'undefined' ? null : isChaosHash() ? 'projects' : resolveNode(window.location.hash.slice(1));
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return { visited: Array.isArray(saved.visited) ? saved.visited.filter((id) => BY_ID[id]) : [], complete: !!saved.complete };
  } catch {
    return { visited: [], complete: false };
  }
}

function saveProgress(visited, complete) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ visited: [...visited], complete }));
  } catch {
    /* storage unavailable: progress just won't persist */
  }
}

const Uptime = ({ since }) => {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const t = setInterval(() => setNow(performance.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((now - since) / 1000);
  return (
    <span className="tabular-nums">
      {String(Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}
    </span>
  );
};

const PanelTitle = ({ children, right }) => (
  <div className="flex h-9 shrink-0 items-center justify-between border-b border-line px-3 font-mono text-[10.5px] uppercase tracking-wider text-subtle">
    <span>{children}</span>
    {right && <span className="normal-case tracking-normal">{right}</span>}
  </div>
);

const Console = ({ github, darkMode, toggleTheme, onPlay }) => {
  const bootAt = useRef(performance.now());
  const initial = useRef(null);
  if (!initial.current) {
    const progress = loadProgress();
    const start = hashNode() || 'gateway';
    initial.current = { start, visited: new Set([...progress.visited, start]), complete: progress.complete };
  }

  const [active, setActive] = useState(initial.current.start);
  const [visited, setVisited] = useState(initial.current.visited);
  const [complete, setComplete] = useState(initial.current.complete);
  const [banner, setBanner] = useState(false);
  const [flight, setFlight] = useState(null);
  const [focus, setFocus] = useState(null);
  const [labSignal, setLabSignal] = useState(() => (isChaosHash() ? 1 : 0));
  const [requests, setRequests] = useState(0);
  const [log, setLog] = useState([]);

  const inspectorRef = useRef(null);
  const cmdRef = useRef(null);
  const seq = useRef(0);
  const live = useRef({ active, visited, complete });
  live.current = { active, visited, complete };

  const emit = useCallback((level, msg) => {
    const entry = { id: ++seq.current, t: performance.now() - bootAt.current, level, msg };
    setLog((l) => [...l.slice(-LOG_LIMIT), entry]);
  }, []);

  useEffect(() => saveProgress(visited, complete), [visited, complete]);

  // ---- routing -------------------------------------------------------------------------------
  const route = useCallback(
    (to, { fromHistory = false, scroll = true } = {}) => {
      const { active: from, visited: seen, complete: done } = live.current;
      if (to === from) {
        emit('INFO', `already on ${BY_ID[to].svc}`);
        return;
      }
      const path = routeBetween(from, to);
      const hops = path.length - 1;
      const id = ++seq.current;
      setFlight({ id, path });
      setTimeout(() => setFlight((f) => (f && f.id === id ? null : f)), hops * HOP_SECONDS * 1000 + 250);

      setActive(to);
      if (to !== 'projects') {
        setFocus(null);
        setLabSignal(0);
      }
      setRequests((r) => r + 1);
      if (!fromHistory) window.history.pushState(null, '', `#${to}`);
      emit('INFO', `GET /${to} → 200 · ${hops} hop${hops === 1 ? '' : 's'} via ${path.map((p) => BY_ID[p].svc).join(' → ')}`);

      if (!seen.has(to)) {
        const next = new Set(seen).add(to);
        setVisited(next);
        emit('OK', `${BY_ID[to].svc} probed · healthy · coverage ${next.size}/${NODES.length}`);
        if (next.size === NODES.length && !done) {
          setComplete(true);
          setBanner(true);
          emit('OK', 'full coverage: every service is healthy. Thanks for the thorough review.');
        }
      }

      if (scroll && inspectorRef.current) {
        if (isDesktop()) inspectorRef.current.scrollTo({ top: 0 });
        else inspectorRef.current.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    },
    [emit]
  );

  // Back / forward buttons, and links that change the hash.
  useEffect(() => {
    const onNav = () => {
      if (window.location.hash === '#play') return; // handled by App (pixel-town game)
      const to = hashNode() || 'gateway';
      if (to !== live.current.active) route(to, { fromHistory: true });
      if (isChaosHash()) setLabSignal(Date.now());
    };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
    };
  }, [route]);

  // Keyboard: 1–6 route, "/" focuses the console.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
      if (e.key === '/') {
        e.preventDefault();
        cmdRef.current?.focus();
        return;
      }
      const node = NODES.find((n) => n.key === e.key);
      if (node) route(node.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [route]);

  // ---- boot sequence (non-blocking: content is already on screen) -----------------------------
  useEffect(() => {
    const { visited: seen, start } = { ...initial.current };
    const lines = [
      ['SYS', `boot shivraj.sys · ${profile.name}, ${profile.role}`],
      ['SYS', `profile: ${profile.focus} · ${profile.location}`],
      ['OK', `${NODES.length} services registered · ${BY_ID[start].svc} healthy`],
      seen.size > 1
        ? ['INFO', `welcome back · coverage ${seen.size}/${NODES.length} restored`]
        : isDesktop()
          ? ['INFO', 'tip: click a node on the map, press 1–6, or type "help"']
          : ['INFO', 'tip: tap a node on the map, or use the dock below'],
    ];
    const step = prefersReducedMotion() ? 0 : 140;
    const timers = lines.map(([lvl, msg], i) => setTimeout(() => emit(lvl, msg), i * step));
    return () => timers.forEach(clearTimeout);
  }, [emit]);

  // Report the GitHub sync once it settles.
  const synced = useRef(false);
  useEffect(() => {
    if (github.loading || synced.current) return;
    synced.current = true;
    if (github.source === 'live') emit('OK', `upstream sync: live from GitHub · ${github.projects.length} repos`);
    else emit('WARN', `upstream sync: GitHub API unavailable, serving build snapshot (${github.projects.length} repos)`);
  }, [github.loading, github.source, github.projects.length, emit]);

  // ---- console commands --------------------------------------------------------------------
  const projectIds = useMemo(() => github.projects.map((p) => p.id.toLowerCase()), [github.projects]);

  const runCommand = useCallback(
    (raw) => {
      emit('CMD', raw);
      for (const fx of parse(raw)) {
        switch (fx.type) {
          case 'route':
            route(fx.to);
            break;
          case 'inspect': {
            const q = fx.query.toLowerCase();
            const p =
              github.projects.find((x) => x.id.toLowerCase() === q || x.title.toLowerCase() === q) ||
              github.projects.find((x) => x.id.toLowerCase().includes(q) || x.title.toLowerCase().includes(q));
            if (!p) {
              emit('ERR', `no project matching "${fx.query}"`);
              break;
            }
            if (live.current.active !== 'projects') route('projects', { scroll: false });
            setFocus({ id: p.id, n: Date.now() });
            emit('OK', `inspect ${p.title}${p.tagline ? ` · ${p.tagline}` : ''}`);
            break;
          }
          case 'chaos':
            if (live.current.active !== 'projects') route('projects', { scroll: false });
            setLabSignal(Date.now());
            emit('OK', 'chaos lab armed · try killing a busy worker');
            break;
          case 'help':
            COMMANDS.forEach(([c, d]) => emit('INFO', `${c.padEnd(26, ' ')} ${d}`));
            break;
          case 'ls':
            NODES.forEach((n) =>
              emit(
                'INFO',
                `${live.current.visited.has(n.id) ? '●' : '○'} ${n.key}  ${n.svc.padEnd(15, ' ')} ${n.label} · ${n.blurb}`
              )
            );
            break;
          case 'whoami':
            emit('INFO', `${profile.name} · ${profile.role} · ${profile.focus} · ${profile.location}`);
            break;
          case 'status':
            emit(
              'INFO',
              `coverage ${live.current.visited.size}/${NODES.length} · uptime ${fmtClock(performance.now() - bootAt.current)}`
            );
            break;
          case 'download': {
            const a = document.createElement('a');
            a.href = profile.resume;
            a.download = '';
            a.click();
            emit('OK', 'resume.pdf → download started');
            break;
          }
          case 'open': {
            if (fx.target === 'email') {
              window.location.href = `mailto:${profile.email}`;
              emit('OK', `opening mail client → ${profile.email}`);
            } else {
              window.open(profile[fx.target], '_blank', 'noopener,noreferrer');
              emit('OK', `opening ${fx.target} in a new tab`);
            }
            break;
          }
          case 'play':
            emit('OK', 'launching pixel-town client…');
            onPlay();
            break;
          case 'theme':
            toggleTheme();
            emit('OK', `theme → ${darkMode ? 'light' : 'dark'}`);
            break;
          case 'clear':
            setLog([]);
            break;
          case 'reset':
            setVisited(new Set([live.current.active]));
            setComplete(false);
            setBanner(false);
            emit('OK', 'progress reset · coverage 1/6');
            break;
          case 'log':
            emit(fx.level, fx.msg);
            break;
          default:
            break;
        }
      }
    },
    [emit, route, github.projects, toggleTheme, darkMode, onPlay]
  );

  const suggestions = useMemo(() => {
    const unseen = ORDER.filter((id) => !visited.has(id));
    if (!unseen.length) return ['route contact', 'resume', 'email'];
    const s = unseen.slice(0, 3).map((id) => `route ${id}`);
    if (active === 'projects') s.unshift('chaos', 'inspect taskflow');
    else if (visited.size <= 1) s.push('help');
    return s;
  }, [visited, active]);

  // ---- render --------------------------------------------------------------------------------
  const node = BY_ID[active];
  const idx = ORDER.indexOf(active);
  const prev = BY_ID[ORDER[idx - 1]];
  const nextNode = BY_ID[ORDER[idx + 1]];
  const lastEvent = log[log.length - 1];
  const badges = { projects: github.projects.length };

  const views = {
    gateway: <ProfileView github={github} onRoute={route} />,
    experience: <ExperienceView />,
    projects: <ProjectsView github={github} focus={focus} labSignal={labSignal} onEvent={emit} />,
    skills: <SkillsView languages={github.languages} />,
    awards: <AwardsView />,
    contact: <ContactView />,
  };

  return (
    <div className="min-h-screen lg:flex lg:h-screen lg:flex-col">
      {/* ---------- system bar ---------- */}
      <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b border-line bg-bg/85 px-3 backdrop-blur-md sm:px-4">
        <button
          type="button"
          onClick={() => route('gateway')}
          className="flex min-w-0 items-center gap-2 font-mono text-sm"
          aria-label="Go to profile"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
          </span>
          <span className="font-semibold text-ink">shivraj.sys</span>
          <span className="hidden truncate text-subtle md:inline">· {profile.name}, {profile.role}</span>
        </button>

        <div className="ml-auto flex items-center gap-4 font-mono text-[11px] text-subtle">
          <span className="flex items-center gap-2" title="Sections you have visited">
            <span className="hidden sm:inline">coverage</span>
            <span className="flex gap-0.5" aria-hidden="true">
              {ORDER.map((id) => (
                <span key={id} className={`h-2.5 w-1.5 rounded-sm ${visited.has(id) ? 'bg-ok' : 'bg-line'}`} />
              ))}
            </span>
            <span className="tabular-nums text-ink">
              {visited.size}/{NODES.length}
            </span>
          </span>
          <span className="hidden items-center gap-1.5 md:flex" title="Time on this site">
            uptime <span className="text-ink"><Uptime since={bootAt.current} /></span>
          </span>
          <span className="hidden items-center gap-1.5 xl:flex" title="Pages opened this visit">
            req <span className="tabular-nums text-ink">{requests}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-ink"
          title="Explore this portfolio as a pixel-art town"
          aria-label="Play: explore the portfolio as a game"
        >
          <GamepadIcon className="h-4 w-4 text-accent" />
          <span className="hidden sm:inline">Play</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-raised hover:text-ink"
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </button>
        <a
          href={profile.resume}
          download
          className="rounded-lg p-2 text-muted transition-colors hover:bg-raised hover:text-ink sm:hidden"
          aria-label="Download resume (PDF)"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </a>
        <a href={profile.resume} download className="btn-primary hidden !px-3 !py-1.5 !text-xs sm:inline-flex">
          <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Resume
        </a>
      </header>

      <div className="lg:flex lg:min-h-0 lg:flex-1">
        {/* ---------- control plane ---------- */}
        <aside className="border-b border-line bg-surface/40 lg:flex lg:w-[420px] lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r xl:w-[460px]">
          <PanelTitle right={<span className="hidden sm:inline">click a node · keys 1–6</span>}>topology</PanelTitle>
          <div className="px-3 py-3">
            <TopologyMap active={active} visited={visited} flight={flight} badges={badges} onRoute={route} />
          </div>

          {lastEvent && (
            <p className="truncate border-t border-line px-3 py-2 font-mono text-[10.5px] text-subtle lg:hidden">
              <span className="text-accent">›</span> {lastEvent.msg}
            </p>
          )}

          <div className="hidden min-h-0 flex-1 flex-col border-t border-line lg:flex">
            <PanelTitle right={<span>{log.length} events</span>}>event log</PanelTitle>
            <div className="min-h-0 flex-1">
              <EventLog entries={log} />
            </div>
            <CommandLine ref={cmdRef} onSubmit={runCommand} suggestions={suggestions} projectIds={projectIds} />
          </div>
        </aside>

        {/* ---------- inspector ---------- */}
        <main ref={inspectorRef} className="scroll-mt-12 pb-24 lg:min-w-0 lg:flex-1 lg:overflow-y-auto lg:pb-0">
          <div className="sticky top-12 z-30 flex h-10 items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 font-mono text-[11px] backdrop-blur-md sm:px-6 lg:top-0 lg:px-10">
            <span className="flex min-w-0 items-center gap-2 text-subtle">
              <span className="hidden sm:inline">inspector</span>
              <span className="hidden sm:inline">/</span>
              <span className="truncate text-ink">{node.svc}</span>
              <span className="flex items-center gap-1 text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" /> 200
              </span>
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                disabled={!prev}
                onClick={() => prev && route(prev.id)}
                className="rounded p-1 text-muted hover:bg-raised hover:text-ink disabled:opacity-30"
                aria-label={prev ? `Previous: ${prev.label}` : 'No previous section'}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="tabular-nums text-subtle">
                {idx + 1}/{ORDER.length}
              </span>
              <button
                type="button"
                disabled={!nextNode}
                onClick={() => nextNode && route(nextNode.id)}
                className="rounded p-1 text-muted hover:bg-raised hover:text-ink disabled:opacity-30"
                aria-label={nextNode ? `Next: ${nextNode.label}` : 'No next section'}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </span>
          </div>

          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
            <AnimatePresence>
              {banner && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-8 flex items-start justify-between gap-4 rounded-xl border border-ok/40 bg-ok/10 p-4 text-sm"
                  role="status"
                >
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ok">full coverage · 6/6 healthy</p>
                    <p className="mt-1 text-ink">
                      You've seen every part of the system. If it looks like a fit, the egress node is how we talk.
                    </p>
                    {active !== 'contact' && (
                      <button type="button" onClick={() => route('contact')} className="link mt-2 font-medium">
                        Route to contact →
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBanner(false)}
                    className="rounded p-1 text-muted hover:text-ink"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {views[active]}
                <NextHop current={active} onRoute={route} />
              </motion.div>
            </AnimatePresence>

            <footer className="mt-16 flex flex-col gap-1 border-t border-line pt-6 font-mono text-[11px] text-subtle sm:flex-row sm:justify-between">
              <span>
                © {new Date().getFullYear()} {profile.name}
              </span>
              <span>projects sync from github.com/{profile.githubUser}</span>
            </footer>
          </div>
        </main>
      </div>

      {/* ---------- mobile dock ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Sections"
      >
        {NODES.map((n) => {
          const Icon = DOCK_ICONS[n.id];
          const on = n.id === active;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => route(n.id)}
              aria-current={on ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] ${on ? 'text-accent' : 'text-muted'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate px-0.5">{n.label}</span>
              <span
                className={`absolute right-[calc(50%-14px)] top-1.5 h-1.5 w-1.5 rounded-full ${
                  visited.has(n.id) ? 'bg-ok' : 'bg-line'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Console;
