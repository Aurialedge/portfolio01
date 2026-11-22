import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, PlayIcon, StarIcon } from '@heroicons/react/24/outline';
import { GitHubIcon } from './Icons';
import { languageColor } from '../lib/languages';
import { timeAgo } from '../lib/github';

export const LinkButton = ({ href, onClick, children, primary }) => {
  const cls = primary
    ? 'inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-bg hover:bg-ink/85'
    : 'inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-muted hover:border-ink/30 hover:text-ink';
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
};

export const ProjectLinks = ({ project, onPlay }) => (
  <div className="flex flex-wrap gap-2">
    {project.video && (
      <LinkButton primary onClick={() => onPlay({ id: project.video, title: project.title })}>
        <PlayIcon className="h-3.5 w-3.5" /> Watch demo
      </LinkButton>
    )}
    {project.live && (
      <LinkButton href={project.live} primary={!project.video}>
        <ArrowUpRightIcon className="h-3.5 w-3.5" /> Live
      </LinkButton>
    )}
    <LinkButton href={project.github}>
      <GitHubIcon className="h-3.5 w-3.5" /> Code
    </LinkButton>
  </div>
);

const ProjectCard = ({ project, onPlay, highlight }) => (
  <motion.article
    id={`svc-${project.id}`}
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className={`card group flex scroll-mt-24 flex-col overflow-hidden transition-colors hover:border-accent/40 ${
      highlight ? 'border-accent ring-2 ring-accent/30' : ''
    }`}
  >
    {project.image && (
      <div className="aspect-[16/8] overflow-hidden border-b border-line bg-raised">
        <img
          src={project.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    )}
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-3 flex items-center justify-between gap-2 font-mono text-[11px] text-subtle">
        <span className="flex items-center gap-1.5">
          {project.language && (
            <>
              <span className="h-2 w-2 rounded-full" style={{ background: languageColor(project.language) }} />
              {project.language}
            </>
          )}
        </span>
        <span className="flex items-center gap-2">
          {project.stars > 0 && (
            <span className="flex items-center gap-0.5">
              <StarIcon className="h-3 w-3" /> {project.stars}
            </span>
          )}
          {project.pushedAt && <span title={new Date(project.pushedAt).toLocaleString()}>{timeAgo(project.pushedAt)}</span>}
        </span>
      </div>

      <h3 className="flex flex-wrap items-center gap-2 font-semibold tracking-tight">
        <a href={project.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          {project.title}
        </a>
        {project.status && (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-px text-[10px] font-medium text-accent">
            {project.status}
          </span>
        )}
      </h3>
      <div className="mt-2 flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted" title={project.description}>
          {project.description || 'No description yet. Have a look at the source on GitHub.'}
        </p>
      </div>

      {project.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 5).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5">
        <ProjectLinks project={project} onPlay={onPlay} />
      </div>
    </div>
  </motion.article>
);

export default ProjectCard;
