import React, { useMemo, useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpRightIcon, PlayIcon } from '@heroicons/react/24/solid';
import { profile, education, stats, experience, skills, achievements, certifications } from '../data/profile';
import { GitHubIcon, LinkedInIcon, LeetCodeIcon } from '../components/Icons';
import { ContactForm } from '../sections/Contact';
import { languageColor } from '../lib/languages';
import { timeAgo } from '../lib/github';
import avatar from '../image/avatar.webp';

const H = ({ children }) => <h3 className="mb-3 font-pixel text-[11px] uppercase leading-relaxed text-amber-300">{children}</h3>;

const Btn = ({ href, onClick, children, primary }) => {
  const cls = `inline-flex items-center gap-1.5 border-2 px-3 py-1.5 font-pixel text-[9px] uppercase transition-transform active:translate-y-px ${
    primary
      ? 'border-amber-200 bg-amber-400 text-stone-900 hover:bg-amber-300'
      : 'border-stone-500 bg-stone-800 text-stone-100 hover:bg-stone-700'
  }`;
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  ) : (
    <a href={href} target={href?.startsWith('/') || href?.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
};

const Chip = ({ children }) => (
  <span className="inline-block border border-stone-600 bg-stone-800 px-1.5 py-0.5 font-mono text-[11px] text-stone-300">{children}</span>
);

const Bullets = ({ items }) => (
  <ul className="space-y-1.5 text-sm leading-relaxed text-stone-300">
    {items.map((t) => (
      <li key={t} className="flex gap-2">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-amber-400" />
        {t}
      </li>
    ))}
  </ul>
);

function About() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <img src={avatar} alt="" className="h-16 w-16 border-2 border-amber-300 bg-stone-700 object-cover [image-rendering:auto]" />
        <div>
          <p className="font-pixel text-xs text-white">{profile.name}</p>
          <p className="mt-1 text-sm text-stone-400">
            {profile.role} · {profile.location}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-stone-300">{profile.summary}</p>
      <div>
        <H>Education</H>
        <p className="text-sm text-white">{education.school}</p>
        <p className="text-sm text-stone-400">
          {education.degree} · {education.period} · {education.grade}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="border-2 border-stone-600 bg-stone-800 p-2 text-center">
            <p className="font-pixel text-[11px] text-amber-300">{s.value}</p>
            <p className="mt-1.5 text-[11px] leading-tight text-stone-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Experience() {
  return (
    <div className="space-y-5">
      {experience.map((job) => (
        <div key={job.company} className="border-2 border-stone-600 bg-stone-800/60 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-pixel text-[11px] text-white">
              {job.role} @ {job.company}
            </p>
            <p className="font-mono text-xs text-stone-400">{job.period}</p>
          </div>
          <div className="mt-3">
            <Bullets items={job.points} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-stone-400">Quest log: more entries unlock as the career continues.</p>
    </div>
  );
}

function Projects({ github, onPlay }) {
  const [q, setQ] = useState('');
  const featured = useMemo(
    () => github.projects.filter((p) => p.featuredRank >= 0).sort((a, b) => a.featuredRank - b.featuredRank),
    [github.projects]
  );
  const rest = useMemo(() => {
    const s = q.trim().toLowerCase();
    return github.projects
      .filter((p) => p.featuredRank < 0)
      .filter((p) => !s || [p.title, p.description, p.language, ...p.tags].some((x) => x && x.toLowerCase().includes(s)))
      .sort((a, b) => b.curated - a.curated || b.pushedAt.localeCompare(a.pushedAt));
  }, [github.projects, q]);

  return (
    <div className="space-y-6">
      <div>
        <H>★ Legendary cabinets</H>
        <div className="space-y-3">
          {featured.map((p) => (
            <div key={p.id} className="border-2 border-fuchsia-400/60 bg-gradient-to-br from-indigo-950 to-stone-900 p-4">
              <p className="font-pixel text-xs text-cyan-300">{p.title}</p>
              <p className="mt-1 text-xs text-fuchsia-300">{p.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-300">{p.description}</p>
              {p.metrics.length > 0 && (
                <div className="mt-3 flex gap-4">
                  {p.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="font-pixel text-[10px] text-amber-300">{m.value}</p>
                      <p className="text-[11px] text-stone-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 6).map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.video && (
                  <Btn primary onClick={() => onPlay({ id: p.video, title: p.title })}>
                    <PlayIcon className="h-3 w-3" /> Play demo
                  </Btn>
                )}
                {p.live && (
                  <Btn href={p.live} primary={!p.video}>
                    <ArrowUpRightIcon className="h-3 w-3" /> Live
                  </Btn>
                )}
                <Btn href={p.github}>
                  <GitHubIcon className="h-3 w-3" /> Code
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-pixel text-[11px] uppercase text-amber-300">All cabinets ({rest.length})</h3>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search…"
            aria-label="Search projects"
            className="w-36 border-2 border-stone-600 bg-stone-900 px-2 py-1 font-mono text-xs text-white placeholder:text-stone-500 focus:border-amber-300 focus:outline-none"
          />
        </div>
        <ul className="divide-y-2 divide-stone-700 border-2 border-stone-700">
          {rest.map((p) => (
            <li key={p.id} className="p-3">
              <div className="flex items-center justify-between gap-2">
                <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:text-amber-300">
                  {p.title}
                </a>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-stone-400">
                  {p.language && <span className="h-2 w-2" style={{ background: languageColor(p.language) }} />}
                  {p.language} · {timeAgo(p.pushedAt)}
                </span>
              </div>
              {p.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-400">{p.description}</p>}
              {p.live && (
                <a href={p.live} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-mono text-[11px] text-cyan-300 hover:underline">
                  ↗ live
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-stone-500">
          {github.source === 'live' ? 'Cabinets synced live from GitHub.' : 'Showing saved GitHub snapshot.'}
        </p>
      </div>
    </div>
  );
}

function Skills({ github }) {
  const max = github.languages[0]?.count || 1;
  return (
    <div className="space-y-5">
      {skills.map((s) => (
        <div key={s.group}>
          <H>{s.group}</H>
          <div className="flex flex-wrap gap-1.5">
            {s.items.map((i) => (
              <span key={i} className="border-2 border-stone-600 bg-stone-800 px-2 py-1 text-sm text-stone-100">
                {i}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div>
        <H>Stats · languages on GitHub</H>
        <ul className="space-y-2">
          {github.languages.slice(0, 8).map((l) => (
            <li key={l.name} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 truncate text-stone-200">{l.name}</span>
              <span className="h-3 flex-1 border border-stone-600 bg-stone-900">
                <span className="block h-full" style={{ width: `${(l.count / max) * 100}%`, background: languageColor(l.name) }} />
              </span>
              <span className="w-6 text-right font-mono text-xs text-stone-400">{l.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Trophies() {
  return (
    <div className="space-y-6">
      <div>
        <H>Trophies</H>
        <ul className="grid gap-2 sm:grid-cols-2">
          {achievements.map((a) => (
            <li key={a.title} className="border-2 border-amber-500/50 bg-amber-950/30 p-3">
              <p className="text-sm font-semibold text-amber-200">🏆 {a.title}</p>
              <p className="mt-1 text-xs text-stone-400">{a.detail}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <H>Certificates</H>
        <ul className="space-y-2">
          {certifications.map((c) => (
            <li key={c.title}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 border-2 border-stone-600 bg-stone-800 p-3 hover:border-amber-300"
              >
                <span>
                  <span className="block text-sm text-white">📜 {c.title}</span>
                  <span className="text-xs text-stone-400">
                    {c.issuer} · {c.date}
                  </span>
                </span>
                <ArrowUpRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-stone-400" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-stone-300">
        Send a letter by pigeon (it's actually email). Open to software engineering roles and internships.
      </p>
      <div className="flex flex-wrap gap-2">
        <Btn primary href={`mailto:${profile.email}`}>
          ✉ {profile.email}
        </Btn>
        <Btn href={profile.linkedin}>
          <LinkedInIcon className="h-3 w-3" /> LinkedIn
        </Btn>
        <Btn href={profile.github}>
          <GitHubIcon className="h-3 w-3" /> GitHub
        </Btn>
        <Btn href={profile.leetcode}>
          <LeetCodeIcon className="h-3 w-3" /> LeetCode
        </Btn>
      </div>
      <div className="dark">
        <ContactForm />
      </div>
    </div>
  );
}

function Chest() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-5xl">📜</p>
      <p className="font-pixel text-xs leading-relaxed text-amber-300">You found a Legendary Resume!</p>
      <p className="text-sm text-stone-300">One page, everything that matters: experience, projects, skills, achievements.</p>
      <div className="flex justify-center">
        <Btn primary href={profile.resume}>
          <ArrowDownTrayIcon className="h-3 w-3" /> Download resume
        </Btn>
      </div>
    </div>
  );
}

function Sign({ github }) {
  const p = github.lastPush;
  return (
    <div className="space-y-3 font-mono text-sm">
      <p className="text-stone-400">~ TOWN NOTICE BOARD ~</p>
      {p ? (
        <>
          <p className="text-stone-200">
            Latest activity on GitHub: <span className="text-amber-300">{p.title}</span>
          </p>
          <p className="text-stone-400">pushed {timeAgo(p.pushedAt)}</p>
          <p className="text-stone-400">
            {github.projects.length} public repos · {github.languages.length} languages
          </p>
          <div className="pt-1">
            <Btn href={p.github}>
              <GitHubIcon className="h-3 w-3" /> View repo
            </Btn>
          </div>
        </>
      ) : (
        <p className="text-stone-300">The board is blank. Check back soon.</p>
      )}
    </div>
  );
}

export const PANELS = {
  about: { title: 'Home · About me', Component: About },
  experience: { title: 'Experience HQ', Component: Experience },
  projects: { title: 'Projects Arcade', Component: Projects },
  skills: { title: 'Skills Dojo', Component: Skills },
  trophies: { title: 'Trophy Hall', Component: Trophies },
  contact: { title: 'Post Office', Component: Contact },
  chest: { title: 'Treasure chest', Component: Chest },
  sign: { title: 'Signboard', Component: Sign },
};
