import { useEffect, useMemo, useState } from 'react';
import snapshot from '../data/github-snapshot.json';
import { buildProjects, fetchReadmeSummary, loadRepos } from '../lib/github';

/**
 * Renders instantly from the build-time snapshot, then swaps in the live GitHub
 * repo list. Repos created after the last build get their README summarized on the fly.
 */
export default function useGitHubProjects() {
  const [state, setState] = useState({
    repos: snapshot.repos,
    source: 'snapshot',
    syncedAt: Date.parse(snapshot.generatedAt),
    loading: true,
  });
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    let cancelled = false;
    loadRepos().then(async (result) => {
      if (cancelled) return;
      setState({ ...result, loading: false });

      const known = new Set(snapshot.repos.map((r) => r.name));
      const missing = result.repos.filter((r) => !r.description && !known.has(r.name)).slice(0, 8);
      if (!missing.length) return;
      const entries = await Promise.all(missing.map(async (r) => [r.name, await fetchReadmeSummary(r.name)]));
      if (!cancelled) setSummaries(Object.fromEntries(entries.filter(([, s]) => s)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const projects = useMemo(() => buildProjects(state.repos, summaries), [state.repos, summaries]);

  const languages = useMemo(() => {
    const counts = {};
    for (const p of projects) if (p.language) counts[p.language] = (counts[p.language] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [projects]);

  const lastPush = useMemo(
    () => projects.reduce((latest, p) => (!latest || p.pushedAt > latest.pushedAt ? p : latest), null),
    [projects]
  );

  return { ...state, projects, languages, lastPush };
}
