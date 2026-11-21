import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { profile } from '../data/profile';
import { SocialLinks } from '../components/Footer';
import { languageColor } from '../lib/languages';
import { timeAgo } from '../lib/github';
import avatar from '../image/avatar.webp';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const GitHubPanel = ({ github }) => {
  const { projects, languages, lastPush, source } = github;
  const total = languages.reduce((sum, l) => sum + l.count, 0) || 1;
  const top = languages.slice(0, 5);

  return (
    <div className="card overflow-hidden font-mono text-xs shadow-2xl shadow-black/5 dark:shadow-black/40">
      <div className="flex items-center justify-between border-b border-line bg-raised/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <span className="flex items-center gap-1.5 text-subtle">
          <span className={`h-1.5 w-1.5 rounded-full ${source === 'live' ? 'animate-pulse bg-ok' : 'bg-subtle'}`} />
          github.com/{profile.githubUser}
        </span>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-subtle">public repos</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{projects.length}</p>
          </div>
          <div>
            <p className="text-subtle">languages</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{languages.length}</p>
          </div>
        </div>

        <div>
          <div className="flex h-2 overflow-hidden rounded-full bg-raised">
            {top.map((l) => (
              <span
                key={l.name}
                style={{ width: `${(l.count / total) * 100}%`, background: languageColor(l.name) }}
                title={`${l.name}: ${l.count}`}
              />
            ))}
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-muted">
            {top.map((l) => (
              <li key={l.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: languageColor(l.name) }} />
                {l.name}
              </li>
            ))}
          </ul>
        </div>

        {lastPush && (
          <a
            href={lastPush.github}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-line bg-bg/50 p-3 transition-colors hover:border-accent/50"
          >
            <p className="text-subtle">$ git log -1 --latest</p>
            <p className="mt-1 truncate text-ink">
              <span className="text-accent">→</span> {lastPush.title}
            </p>
            <p className="mt-0.5 text-subtle">pushed {timeAgo(lastPush.pushedAt)}</p>
          </a>
        )}
      </div>
    </div>
  );
};

const Hero = ({ github }) => {
  const latestRole = 'CS @ IIIT Nagpur';
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />

      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.div {...fade(0)} className="mb-6 flex items-center gap-4">
            <img
              src={avatar}
              alt={profile.name}
              width="64"
              height="64"
              className="h-16 w-16 rounded-full border border-line bg-raised object-cover"
            />
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="flex items-center gap-1 text-sm text-muted">
                <MapPinIcon className="h-4 w-4" /> {profile.location} · {latestRole}
              </p>
            </div>
          </motion.div>

          <motion.p {...fade(0.05)} className="eyebrow mb-4 flex flex-wrap gap-x-2">
            {profile.focus.split(' · ').map((part, i) => (
              <span key={part} className="whitespace-nowrap">
                {i > 0 && <span className="mr-2 text-subtle">·</span>}
                {part}
              </span>
            ))}
          </motion.p>

          <motion.h1
            {...fade(0.1)}
            className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            I build backend systems that stay <span className="text-accent">correct under load</span>.
          </motion.h1>

          <motion.p {...fade(0.15)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {profile.summary}
          </motion.p>

          <motion.div {...fade(0.2)} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn-primary">
              View projects <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a href={profile.resume} download className="btn-ghost">
              <ArrowDownTrayIcon className="h-4 w-4" /> Resume
            </a>
            <SocialLinks className="ml-1" />
          </motion.div>
        </div>

        <motion.div {...fade(0.25)}>
          <GitHubPanel github={github} />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
