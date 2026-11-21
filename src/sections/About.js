import React from 'react';
import { motion } from 'framer-motion';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import Section, { reveal } from '../components/Section';
import { education, stats } from '../data/profile';

const About = () => (
  <Section id="about" eyebrow="About" title="Engineer first, stack second.">
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <motion.div {...reveal} className="space-y-4 text-base leading-relaxed text-muted">
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
          Recently I interned as an SDE at <span className="text-ink">Veqiro</span>, building backend systems for a
          multi-agent AI workforce platform.
        </p>
      </motion.div>

      <motion.div {...reveal} className="space-y-4">
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
      </motion.div>
    </div>
  </Section>
);

export default About;
