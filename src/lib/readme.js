// Browser copy of summarizeReadme() in scripts/fetch-github.js — keep the two in sync.
const BOILERPLATE =
  /template provides|lint rules|Flutter|starting point|bootstrapped|Project link|Table of Contents|Submitted by|\.env|localhost|https?:\/\/|├|CGPA|return \{/i;

export function summarizeReadme(md) {
  if (!md) return '';
  const text = md
    .replace(/^﻿/, '')
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^(<<<<<<<|=======|>>>>>>>).*$/gm, '');
  for (const raw of text.split(/\n\s*\n/)) {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/^(#|\||!\[|---|([-*+]|\d+\.)\s)/.test(l));
    const p = lines
      .join(' ')
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
