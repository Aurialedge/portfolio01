import React from 'react';
import { AcademicCapIcon, ArrowDownTrayIcon, ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { education, profile, stats } from '../../data/profile';
import { SocialLinks } from '../../components/Social';
import { languageColor } from '../../lib/languages';
import { timeAgo } from '../../lib/github';
import avatar from '../../image/avatar.webp';

const GitHubPanel = ({ github }) => {
  const { projects, languages, lastPush, source } = github;
  const total = languages.reduce((sum, l) => sum + l.count, 0) || 1;
  const top = languages.slice(0, 5);

  return (
    <div className="card overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between border-b border-line bg-raised/60 px-4 py-2.5 text-subtle">
        <span className="uppercase tracking-wider">upstream</span>
        <span className="flex items-center gap-1.5">
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

const ProfileView = ({ github, onRoute }) => (
  <div>
    <div className="mb-6 flex items-center gap-4">
      <img
        src={avatar}
        alt={profile.name}
        width="64"
        height="64"
        className="h-16 w-16 rounded-full border border-line bg-raised object-cover"
      />
      <div>
        <h1 className="font-semibold">{profile.name}</h1>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPinIcon className="h-4 w-4" /> {profile.location} · {profile.role}
        </p>
      </div>
    </div>

    <p className="eyebrow mb-4 flex flex-wrap gap-x-2">
      {profile.focus.split(' · ').map((part, i) => (
        <span key={part} className="whitespace-nowrap">
          {i > 0 && <span className="mr-2 text-subtle">·</span>}
          {part}
        </span>
      ))}
    </p>
    <p className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
      I build backend systems that stay <span className="text-accent">correct under load</span>.
    </p>
    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{profile.summary}</p>

    <div className="mt-8 flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => onRoute('projects')} className="btn-primary">
        Open projects <ArrowRightIcon className="h-4 w-4" />
      </button>
      <a href={profile.resume} download className="btn-ghost">
        <ArrowDownTrayIcon className="h-4 w-4" /> Resume PDF
      </a>
      <SocialLinks className="ml-1" />
    </div>

    <div className="mt-14 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4 text-base leading-relaxed text-muted">
        <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">about</p>
        <p>
          I'm a Computer Science undergraduate at IIIT Nagpur who likes the parts of software most people never see: the
          queue that guarantees a job runs exactly when it should, the index that turns a slow query into a fast one, the
          audit trail you can prove hasn't been touched.
        </p>
        <p>
          Most of my recent work is backend and distributed systems in <span className="text-ink">Go</span>,{' '}
          <span className="text-ink">Node.js</span> and <span className="text-ink">Python</span>: job queues with leases
          and dead-letter queues, RPC over message brokers, and microservice platforms with real security models. I also
          build full-stack products end-to-end and ship applied AI features where they make the product better.
        </p>
        <p>
          Recently I interned as an SDE at{' '}
          <button type="button" onClick={() => onRoute('experience')} className="link">
            Veqiro
          </button>
          , building backend systems for a multi-agent AI workforce platform.
        </p>
      </div>
      <div className="space-y-4">
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
              <AcademicCapIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium">{education.school}</p>
              <p className="mt-0.5 text-sm text-muted">{education.degree}</p>
              <p className="mt-2 font-mono text-xs text-subtle">
                {education.period} · {education.grade}
              </p>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="card p-4">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-lg font-semibold tracking-tight sm:text-xl">{s.value}</dd>
              <dd className="mt-1 text-xs leading-snug text-subtle">{s.label}</dd>
            </div>
          ))}
        </dl>
        <GitHubPanel github={github} />
      </div>
    </div>
  </div>
);

export default ProfileView;
