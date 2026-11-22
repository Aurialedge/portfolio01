import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { CheckIcon, ClipboardIcon, EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ViewHeader } from './common';
import { profile } from '../../data/profile';
import { GitHubIcon, LinkedInIcon, LeetCodeIcon } from '../../components/Icons';

const EMAILJS = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};
const emailConfigured = Object.values(EMAILJS).every(Boolean);

const inputCls =
  'form-input w-full rounded-lg border-line bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-subtle focus:border-accent focus:ring-accent';

export const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!emailConfigured) {
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent('Hello from your portfolio')}&body=${body}`;
      return;
    }
    setStatus('sending');
    try {
      await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, form, { publicKey: EMAILJS.publicKey });
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('EmailJS error', err);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Name</span>
          <input name="name" required value={form.name} onChange={onChange} className={inputCls} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            className={inputCls}
            autoComplete="email"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={onChange}
          className={inputCls}
          placeholder="Role, project, or just a hello…"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          <PaperAirplaneIcon className="h-4 w-4" />
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p role="status" className="text-sm">
          {status === 'sent' && <span className="text-ok">Thanks! I'll get back to you soon.</span>}
          {status === 'error' && (
            <span className="text-red-500">
              Couldn't send. Email me directly at{' '}
              <a className="link" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              .
            </span>
          )}
        </p>
      </div>
    </form>
  );
};

const ContactView = () => {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const links = [
    { label: 'LinkedIn', value: 'shivraj-perkar', href: profile.linkedin, Icon: LinkedInIcon },
    { label: 'GitHub', value: profile.githubUser, href: profile.github, Icon: GitHubIcon },
    { label: 'LeetCode', value: 'Shivraj18', href: profile.leetcode, Icon: LeetCodeIcon },
  ];

  return (
    <div>
      <ViewHeader
        eyebrow="egress"
        title="Let's build something."
        description="Open to software engineering roles and internships, especially backend, distributed systems, and full-stack work. The fastest way to reach me is email."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <div className="card p-6">
            <p className="text-sm text-subtle">Email</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <a href={`mailto:${profile.email}`} className="break-all font-medium hover:text-accent">
                {profile.email}
              </a>
              <button
                onClick={copyEmail}
                className="shrink-0 rounded-lg border border-line p-2 text-muted hover:text-ink"
                aria-label="Copy email address"
                title="Copy"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-ok" /> : <ClipboardIcon className="h-4 w-4" />}
              </button>
            </div>
            <a href={`mailto:${profile.email}`} className="btn-primary mt-4 w-full">
              <EnvelopeIcon className="h-4 w-4" /> Write an email
            </a>
          </div>
          <ul className="card divide-y divide-line">
            {links.map(({ label, value, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-raised/60"
                >
                  <Icon className="h-5 w-5 text-muted" />
                  <span className="text-sm text-subtle">{label}</span>
                  <span className="ml-auto font-mono text-sm">{value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
};

export default ContactView;
