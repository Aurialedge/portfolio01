import snapshot from '../data/github-snapshot.json';
import { curated, featured, hiddenRepos, categoryFromLanguage } from '../data/projects';
import { summarizeReadme } from './readme';

const USER = snapshot.user;
const CACHE_KEY = `gh-repos:${USER}`;
const CACHE_TTL = 30 * 60 * 1000; // GitHub allows 60 unauthenticated requests/hour per visitor IP.

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached;
  } catch {
    /* storage unavailable */
  }
  return null;
}

function writeCache(repos) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
  } catch {
    /* storage unavailable */
  }
}

/**
 * One API call per visitor (cached for the session).
 * Returns { repos, source: 'live' | 'snapshot', syncedAt }.
 */
export async function loadRepos() {
  const cached = readCache();
  if (cached) return { repos: cached.repos, source: 'live', syncedAt: cached.at };

  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    const repos = data
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        description: r.description || '',
        html_url: r.html_url,
        homepage: r.homepage || '',
        language: r.language || '',
        topics: r.topics || [],
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        created_at: r.created_at,
        pushed_at: r.pushed_at,
        archived: r.archived,
      }));
    writeCache(repos);
    return { repos, source: 'live', syncedAt: Date.now() };
  } catch {
    return { repos: snapshot.repos, source: 'snapshot', syncedAt: Date.parse(snapshot.generatedAt) };
  }
}

/** README summaries for repos that are newer than the build snapshot (raw.githubusercontent has no API rate limit). */
export async function fetchReadmeSummary(name) {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${USER}/${name}/HEAD/README.md`);
    return res.ok ? summarizeReadme(await res.text()) : '';
  } catch {
    return '';
  }
}

const snapshotByName = Object.fromEntries(snapshot.repos.map((r) => [r.name, r]));

export function prettifyName(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Merge a GitHub repo with curated metadata into the shape the UI renders. */
export function toProject(repo, extraSummaries = {}) {
  const c = curated[repo.name] || {};
  const tags = c.tags || [...(repo.language ? [repo.language] : []), ...repo.topics.slice(0, 4)];
  return {
    id: repo.name,
    title: c.title || prettifyName(repo.name),
    tagline: c.tagline || '',
    description:
      c.description ||
      repo.description ||
      snapshotByName[repo.name]?.readmeSummary ||
      extraSummaries[repo.name] ||
      '',
    highlights: c.highlights || [],
    metrics: c.metrics || [],
    tags,
    language: repo.language,
    categories: c.category || [categoryFromLanguage(repo.language)],
    github: repo.html_url,
    live: c.live || repo.homepage || '',
    video: c.video || '',
    image: c.image || '',
    status: c.status || (repo.archived ? 'Archived' : ''),
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    featuredRank: featured.indexOf(repo.name),
    curated: Boolean(c.description),
  };
}

export function buildProjects(repos, extraSummaries) {
  return repos.filter((r) => !hiddenRepos.includes(r.name)).map((r) => toProject(r, extraSummaries));
}

export function timeAgo(date) {
  const s = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return `${n} ${unit}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
