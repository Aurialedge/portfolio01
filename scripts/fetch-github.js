#!/usr/bin/env node
/**
 * Build-time GitHub sync.
 *
 * Runs automatically before every `npm run build` (see "prebuild" in package.json),
 * so every Vercel deploy ships with a fresh snapshot of all public repositories,
 * including a short summary pulled from each repo's README.
 *
 * The browser also fetches the live repo list at runtime (src/lib/github.js);
 * this snapshot is the fallback when the GitHub API is rate-limited or offline,
 * and the source of README summaries (fetching ~35 READMEs per visitor is wasteful).
 *
 * Never fails the build: on any error it keeps the existing snapshot.
 *
 * Optional env:  GITHUB_TOKEN  – raises the API rate limit (60/h -> 5000/h)
 * Optional flag: --repos-file <path>  – seed from a saved /users/:user/repos JSON
 */
const fs = require('fs');
const path = require('path');

const USER = 'Aurialedge';
const OUT = path.join(__dirname, '..', 'src', 'data', 'github-snapshot.json');

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const BOILERPLATE =
  /template provides|lint rules|Flutter|starting point|bootstrapped|Project link|Table of Contents|Submitted by|\.env|localhost|https?:\/\/|├|CGPA|return \{/i;

/** Pulls the first meaningful prose paragraph out of a README. Mirrors src/lib/readme.js. */
function summarizeReadme(md) {
  if (!md) return '';
  const text = md
    .replace(/^﻿/, '')
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^(<<<<<<<|=======|>>>>>>>).*$/gm, '');
  const paragraphs = text.split(/\n\s*\n/);
  for (const raw of paragraphs) {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/^(#|\||!\[|---|([-*+]|\d+\.)\s)/.test(l));
    let p = lines.join(' ');
    p = p
      .replace(/!?\[([^\]]*)]\([^)]*\)/g, '$1')
      .replace(/\*\*|__|`|\*/g, '')
      .replace(/^>\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (p.length < 50 || !/[.!?]/.test(p) || /:$/.test(p)) continue;
    if (BOILERPLATE.test(p)) continue;
    return p.length > 240 ? `${p.slice(0, 237).replace(/\s+\S*$/, '')}…` : p;
  }
  return '';
}

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function getReadme(name) {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${USER}/${name}/HEAD/README.md`);
    if (!res.ok) return '';
    const buf = Buffer.from(await res.arrayBuffer());
    // Some READMEs were saved as UTF-16 by Windows tooling.
    const isUtf16 = buf[0] === 0xff && buf[1] === 0xfe;
    return buf.toString(isUtf16 ? 'utf16le' : 'utf8');
  } catch {
    return '';
  }
}

async function main() {
  const fileFlag = process.argv.indexOf('--repos-file');
  let repos;
  if (fileFlag !== -1) {
    repos = JSON.parse(fs.readFileSync(process.argv[fileFlag + 1], 'utf8'));
  } else {
    repos = await getJson(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`);
  }
  if (!Array.isArray(repos)) throw new Error('Unexpected repos payload');

  const owned = repos.filter((r) => !r.fork);
  const readmes = await Promise.all(owned.map((r) => getReadme(r.name)));

  const snapshot = {
    user: USER,
    generatedAt: new Date().toISOString(),
    repos: owned.map((r, i) => ({
      name: r.name,
      description: r.description || '',
      readmeSummary: summarizeReadme(readmes[i]),
      html_url: r.html_url,
      homepage: r.homepage || '',
      language: r.language || '',
      topics: r.topics || [],
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      created_at: r.created_at,
      pushed_at: r.pushed_at,
      archived: r.archived,
    })),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`[fetch-github] Saved ${snapshot.repos.length} repos to ${path.relative(process.cwd(), OUT)}`);
}

main().catch((err) => {
  console.warn(`[fetch-github] Skipped, keeping existing snapshot: ${err.message}`);
});
