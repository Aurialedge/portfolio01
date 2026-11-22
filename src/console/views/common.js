import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { BY_ID, ORDER } from '../topology';

export const ViewHeader = ({ eyebrow, title, description, aside }) => (
  <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
    </div>
    {aside}
  </header>
);

/** "Next hop" link at the end of every view, so the site also reads top-to-bottom like a normal portfolio. */
export const NextHop = ({ current, onRoute }) => {
  const i = ORDER.indexOf(current);
  const next = BY_ID[ORDER[i + 1]];
  if (!next) return null;
  return (
    <button
      type="button"
      onClick={() => onRoute(next.id)}
      className="card group mt-12 flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:border-accent/50"
    >
      <span>
        <span className="block font-mono text-[11px] uppercase tracking-wider text-subtle">next hop · {next.svc}</span>
        <span className="mt-1 block text-lg font-semibold tracking-tight">
          {next.label} <span className="font-normal text-muted">· {next.blurb}</span>
        </span>
      </span>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-accent group-hover:text-accent">
        <ArrowRightIcon className="h-4 w-4" />
      </span>
    </button>
  );
};
