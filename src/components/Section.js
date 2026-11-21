import React from 'react';
import { motion } from 'framer-motion';

export const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const Section = ({ id, eyebrow, title, description, aside, children, className = '' }) => (
  <section id={id} className={`py-20 sm:py-24 ${className}`}>
    <div className="container-page">
      <motion.header {...reveal} className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
        </div>
        {aside}
      </motion.header>
      {children}
    </div>
  </section>
);

export default Section;
