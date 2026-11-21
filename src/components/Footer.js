import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { profile } from '../data/profile';
import { GitHubIcon, LinkedInIcon, LeetCodeIcon } from './Icons';

export const socials = [
  { label: 'GitHub', href: profile.github, Icon: GitHubIcon },
  { label: 'LinkedIn', href: profile.linkedin, Icon: LinkedInIcon },
  { label: 'LeetCode', href: profile.leetcode, Icon: LeetCodeIcon },
  { label: 'Email', href: `mailto:${profile.email}`, Icon: EnvelopeIcon },
];

export const SocialLinks = ({ className = '' }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {socials.map(({ label, href, Icon }) => (
      <a
        key={label}
        href={href}
        target={href.startsWith('mailto') ? undefined : '_blank'}
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-raised hover:text-ink"
      >
        <Icon className="h-5 w-5" />
      </a>
    ))}
  </div>
);

const Footer = () => (
  <footer className="border-t border-line">
    <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm text-subtle sm:flex-row">
      <p>
        © {new Date().getFullYear()} {profile.name}. Projects sync automatically from{' '}
        <a className="link" href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
      <SocialLinks />
    </div>
  </footer>
);

export default Footer;
