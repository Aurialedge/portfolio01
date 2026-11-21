import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';
import { ProjectLinks } from './ProjectCard';
import { reveal } from './Section';

const Media = ({ project, onPlay }) => {
  if (project.video) {
    return (
      <button
        type="button"
        onClick={() => onPlay({ id: project.video, title: project.title })}
        className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-line bg-black"
        aria-label={`Play ${project.title} demo video`}
      >
        <img
          src={`https://i.ytimg.com/vi/${project.video}/maxresdefault.jpg`}
          onError={(e) => {
            // Not every video has a max-res thumbnail; fall back to the (letterboxed) HQ one.
            if (!e.currentTarget.src.includes('hqdefault')) {
              e.currentTarget.src = `https://i.ytimg.com/vi/${project.video}/hqdefault.jpg`;
            }
          }}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-60"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-black shadow-xl transition group-hover:scale-105">
            <PlayIcon className="h-4 w-4" /> Watch demo
          </span>
        </span>
      </button>
    );
  }

  // No video: a schematic "spec sheet" made from the project's metrics and stack.
  return (
    <div className="relative flex min-h-[200px] w-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-line bg-raised p-5 font-mono sm:aspect-video sm:p-6">
      <div className="grid-bg absolute inset-0 opacity-70" />
      <p className="relative text-xs text-subtle">~/{project.id.toLowerCase()} $ make run</p>
      <div className="relative grid grid-cols-2 gap-4">
        {project.metrics.map((m) => (
          <div key={m.label} className="min-w-0">
            <p className="break-words text-xl font-semibold text-ink sm:text-3xl">{m.value}</p>
            <p className="mt-1 text-xs text-subtle">{m.label}</p>
          </div>
        ))}
      </div>
      <p className="relative truncate text-xs text-accent">{project.tags.join(' · ')}</p>
    </div>
  );
};

const FeaturedProject = ({ project, index, onPlay }) => (
  <motion.article {...reveal} className="card grid gap-6 p-5 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8">
    <div className={`min-w-0 ${index % 2 ? 'lg:order-2' : ''}`}>
      <Media project={project} onPlay={onPlay} />
    </div>
    <div className="flex min-w-0 flex-col">
      <p className="font-mono text-xs text-subtle">0{index + 1} · Featured</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{project.title}</h3>
      {project.tagline && <p className="mt-1 text-sm text-accent">{project.tagline}</p>}
      <p className="mt-4 text-sm leading-relaxed text-muted">{project.description}</p>

      {project.highlights.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {h}
            </li>
          ))}
        </ul>
      )}

      {project.metrics.length > 0 && project.video && (
        <dl className="mt-5 flex gap-6">
          {project.metrics.map((m) => (
            <div key={m.label}>
              <dt className="sr-only">{m.label}</dt>
              <dd className="font-mono text-lg font-semibold text-ink">{m.value}</dd>
              <dd className="text-xs text-subtle">{m.label}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-6 lg:mt-auto lg:pt-6">
        <ProjectLinks project={project} onPlay={onPlay} />
      </div>
    </div>
  </motion.article>
);

export default FeaturedProject;
