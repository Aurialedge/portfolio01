import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FeaturedProject from '../../components/FeaturedProject';
import ProjectCard from '../../components/ProjectCard';
import VideoModal from '../../components/VideoModal';
import { CATEGORIES } from '../../data/projects';
import { timeAgo } from '../../lib/github';
import { profile } from '../../data/profile';
import { ViewHeader } from './common';
import ChaosLab from '../lab/ChaosLab';

const SORTS = {
  highlighted: { label: 'Highlighted', fn: (a, b) => b.curated - a.curated || b.pushedAt.localeCompare(a.pushedAt) },
  recent: { label: 'Recently updated', fn: (a, b) => b.pushedAt.localeCompare(a.pushedAt) },
  name: { label: 'Name', fn: (a, b) => a.title.localeCompare(b.title) },
};
const PAGE = 9;

const SyncBadge = ({ source, syncedAt, loading }) => (
  <a
    href={profile.github}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] text-muted hover:text-ink md:self-auto"
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${loading ? 'animate-pulse bg-subtle' : source === 'live' ? 'bg-ok' : 'bg-subtle'}`}
    />
    {loading ? 'syncing with GitHub…' : source === 'live' ? `live from GitHub · ${timeAgo(syncedAt)}` : `GitHub snapshot · ${timeAgo(syncedAt)}`}
  </a>
);

/** `focus` = { id, n } from the console's "inspect" command; n changes on every request so repeats re-trigger. */
const ProjectsView = ({ github, focus, labSignal, onEvent }) => {
  const { projects, source, syncedAt, loading } = github;
  const [video, setVideo] = useState(null);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('highlighted');
  const [expanded, setExpanded] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const closeVideo = useCallback(() => setVideo(null), []);

  const featured = useMemo(
    () => projects.filter((p) => p.featuredRank >= 0).sort((a, b) => a.featuredRank - b.featuredRank),
    [projects]
  );
  const others = useMemo(() => projects.filter((p) => p.featuredRank < 0), [projects]);

  // Make sure an inspected project is rendered, then scroll it into view and flash it.
  useEffect(() => {
    if (!focus) return undefined;
    if (!featured.some((p) => p.id === focus.id)) {
      setFilter('All');
      setQuery('');
      setExpanded(true);
    }
    setHighlight(focus.id);
    const scroll = setTimeout(() => {
      document.getElementById(`svc-${focus.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    const clear = setTimeout(() => setHighlight(null), 2600);
    return () => {
      clearTimeout(scroll);
      clearTimeout(clear);
    };
  }, [focus, featured]);

  const counts = useMemo(() => {
    const c = { All: others.length };
    for (const cat of CATEGORIES) c[cat] = others.filter((p) => p.categories.includes(cat)).length;
    return c;
  }, [others]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return others
      .filter((p) => filter === 'All' || p.categories.includes(filter))
      .filter(
        (p) =>
          !q ||
          [p.title, p.id, p.description, p.language, ...p.tags].some((s) => s && s.toLowerCase().includes(q))
      )
      .sort(SORTS[sort].fn);
  }, [others, filter, query, sort]);

  const shown = expanded ? visible : visible.slice(0, PAGE);

  return (
    <div>
      <ViewHeader
        eyebrow="projects-svc"
        title="Things I've built."
        description="Primary services first, then every public repository on my GitHub. This list updates itself whenever I push a new project."
        aside={<SyncBadge source={source} syncedAt={syncedAt} loading={loading} />}
      />

      <div className="space-y-6">
        {featured.map((p, i) => (
          <React.Fragment key={p.id}>
            <FeaturedProject project={p} index={i} onPlay={setVideo} highlight={highlight === p.id} />
            {p.id === 'TaskFlow' && <ChaosLab openSignal={labSignal} onEvent={onEvent} />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-16">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <h3 className="text-xl font-semibold tracking-tight">
            All repositories <span className="font-mono text-sm font-normal text-subtle">({others.length})</span>
          </h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or tech…"
                className="form-input w-full rounded-lg border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-subtle focus:border-accent focus:ring-accent sm:w-64"
              />
            </label>
            <label className="block">
              <span className="sr-only">Sort projects</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="form-select w-full rounded-lg border-line bg-surface py-2 pl-3 pr-9 text-sm text-ink focus:border-accent focus:ring-accent"
              >
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by category">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={filter === cat}
              onClick={() => {
                setFilter(cat);
                setExpanded(false);
              }}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                filter === cat
                  ? 'border-ink bg-ink text-bg'
                  : 'border-line bg-surface text-muted hover:border-ink/30 hover:text-ink'
              }`}
            >
              {cat} <span className="ml-1 font-mono text-[11px] opacity-60">{counts[cat]}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} onPlay={setVideo} highlight={highlight === p.id} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="card mt-6 p-8 text-center text-sm text-muted">No projects match “{query}”.</p>
      )}

      {visible.length > PAGE && (
        <div className="mt-8 text-center">
          <button className="btn-ghost" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show fewer' : `Show all ${visible.length} projects`}
          </button>
        </div>
      )}

      <VideoModal video={video} onClose={closeVideo} />
    </div>
  );
};

export default ProjectsView;
