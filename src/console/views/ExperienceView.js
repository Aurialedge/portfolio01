import React from 'react';
import { experience } from '../../data/profile';
import { ViewHeader } from './common';

const ExperienceView = () => (
  <div>
    <ViewHeader eyebrow="experience-svc" title="Where I've shipped." />
    <ol className="relative space-y-6 border-l border-line pl-6 sm:pl-8">
      {experience.map((job) => (
        <li key={job.company} className="relative">
          <span className="absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 border-bg bg-accent sm:-left-[39px]" />
          <div className="card p-6">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
              <h3 className="text-lg font-semibold">
                {job.role} <span className="text-muted">· {job.company}</span>
              </h3>
              <p className="font-mono text-xs text-subtle">{job.period}</p>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
              {job.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default ExperienceView;
