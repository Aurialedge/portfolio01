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
