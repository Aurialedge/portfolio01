import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, TrophyIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import Section, { reveal } from '../components/Section';
import { achievements, certifications } from '../data/profile';

const Achievements = () => (
  <Section id="achievements" eyebrow="Recognition" title="Achievements & certifications.">
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div {...reveal} className="card p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <TrophyIcon className="h-5 w-5 text-accent" /> Achievements
        </h3>
        <ul className="mt-5 divide-y divide-line">
          {achievements.map((a) => (
            <li key={a.title} className="py-3 first:pt-0 last:pb-0">
              {a.href ? (
                <a href={a.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 font-medium hover:text-accent">
                  {a.title}
                  <ArrowUpRightIcon className="h-3.5 w-3.5 text-subtle group-hover:text-accent" />
                </a>
              ) : (
                <p className="font-medium">{a.title}</p>
              )}
              <p className="mt-0.5 text-sm text-muted">{a.detail}</p>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div {...reveal} className="card p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <CheckBadgeIcon className="h-5 w-5 text-accent" /> Certifications
        </h3>
        <ul className="mt-5 divide-y divide-line">
          {certifications.map((c) => (
            <li key={c.title} className="py-3 first:pt-0 last:pb-0">
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-4"
              >
                <span>
                  <span className="font-medium group-hover:text-accent">{c.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {c.issuer} · {c.date}
                  </span>
                </span>
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-subtle group-hover:text-accent">
                  credential <ArrowUpRightIcon className="h-3 w-3" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  </Section>
);

export default Achievements;
