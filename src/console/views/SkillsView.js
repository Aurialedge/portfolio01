import React from 'react';
import { motion } from 'framer-motion';
import { skills } from '../../data/profile';
import { languageColor } from '../../lib/languages';
import { ViewHeader } from './common';

const SkillsView = ({ languages }) => {
  const max = languages[0]?.count || 1;
  return (
    <div>
      <ViewHeader title="Tools I reach for." />
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.group} className="card p-5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-subtle">{s.group}</h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {s.items.map((item) => (
                  <li key={item} className="rounded-md border border-line bg-raised px-2.5 py-1 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3 className="font-mono text-xs uppercase tracking-wider text-subtle">Languages on GitHub</h3>
          <p className="mt-1 text-xs text-subtle">Primary language per repository, counted live.</p>
          <ul className="mt-5 space-y-3">
            {languages.slice(0, 9).map((l, i) => (
              <li key={l.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{l.name}</span>
                  <span className="font-mono text-xs text-subtle">{l.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-raised">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: languageColor(l.name) }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(l.count / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.05 * i, ease: 'easeOut' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkillsView;
