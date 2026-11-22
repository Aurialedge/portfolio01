// Parses what the visitor types into the console. Returns a list of effects for Console.js to apply.
import { NODES, resolveNode } from './topology';

export const COMMANDS = [
  ['help', 'list commands'],
  ['ls', 'list services and their status'],
  ['route <node>', 'open a node, e.g. "route projects" (or just type "projects")'],
  ['inspect <project>', 'jump to a project, e.g. "inspect taskflow"'],
  ['whoami', 'one-line summary'],
  ['resume', 'download my resume (PDF)'],
  ['email | github | linkedin', 'reach me'],
  ['theme', 'toggle light / dark'],
  ['status', 'show coverage'],
  ['clear', 'clear the event log'],
  ['reset', 'forget which nodes you have visited'],
];

export const COMPLETIONS = [
  'help',
  'ls',
  'route',
  'inspect',
  'whoami',
  'resume',
  'email',
  'github',
  'linkedin',
  'theme',
  'status',
  'clear',
  'reset',
  ...NODES.map((n) => n.id),
];

export function complete(input, projectIds = []) {
  const parts = input.trimStart().split(/\s+/);
  const last = (parts[parts.length - 1] || '').toLowerCase();
  if (!last) return input;
  const pool =
    parts.length > 1 && parts[0] === 'inspect'
      ? projectIds
      : parts.length > 1
        ? NODES.map((n) => n.id)
        : COMPLETIONS;
  const hits = pool.filter((c) => c.toLowerCase().startsWith(last));
  if (hits.length !== 1) return input;
  parts[parts.length - 1] = hits[0];
  return parts.join(' ') + ' ';
}

/**
 * @returns {Array<{type: string, [k: string]: any}>}
 *   route{to} · inspect{query} · log{level,msg} · help · ls · status · clear · reset · theme · open{href} · download
 */
export function parse(raw) {
  const input = raw.trim();
  if (!input) return [];
  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ');
  const c = cmd.toLowerCase();

  switch (c) {
    case 'help':
    case '?':
      return [{ type: 'help' }];
    case 'ls':
    case 'nodes':
    case 'services':
      return [{ type: 'ls' }];
    case 'route':
    case 'cd':
    case 'go':
    case 'open': {
      const to = resolveNode(arg);
      if (!arg) return [{ type: 'log', level: 'WARN', msg: `usage: ${c} <node>  (try "ls")` }];
      if (!to) return [{ type: 'log', level: 'ERR', msg: `no route to "${arg}"  (try "ls")` }];
      return [{ type: 'route', to }];
    }
    case 'inspect':
    case 'cat':
      if (!arg) return [{ type: 'log', level: 'WARN', msg: 'usage: inspect <project>' }];
      return [{ type: 'inspect', query: arg }];
    case 'whoami':
      return [{ type: 'whoami' }];
    case 'resume':
    case 'cv':
    case 'pdf':
      return [{ type: 'download' }];
    case 'email':
    case 'mail':
      return [{ type: 'open', target: 'email' }];
    case 'github':
    case 'linkedin':
    case 'leetcode':
      return [{ type: 'open', target: c }];
    case 'theme':
      return [{ type: 'theme' }];
    case 'status':
    case 'uptime':
      return [{ type: 'status' }];
    case 'clear':
    case 'cls':
      return [{ type: 'clear' }];
    case 'reset':
      return [{ type: 'reset' }];
    case 'sudo':
      return [{ type: 'log', level: 'WARN', msg: 'permission denied. Hiring decisions require "route contact".' }];
    default: {
      const to = resolveNode(c);
      if (to && !arg) return [{ type: 'route', to }];
      return [{ type: 'log', level: 'ERR', msg: `command not found: ${cmd}  (type "help")` }];
    }
  }
}
