// The portfolio modelled as a small service topology.
// Each node is one part of the portfolio; edges are the routes a request can take between them.

export const NODES = [
  { id: 'gateway', label: 'Profile', svc: 'gateway', key: '1', x: 64, y: 125, blurb: 'Who I am' },
  { id: 'experience', label: 'Experience', svc: 'experience-svc', key: '2', x: 190, y: 50, blurb: 'Where I have shipped' },
  { id: 'projects', label: 'Projects', svc: 'projects-svc', key: '3', x: 300, y: 125, blurb: 'What I have built' },
  { id: 'skills', label: 'Skills', svc: 'skills-svc', key: '4', x: 190, y: 200, blurb: 'Tools I reach for' },
  { id: 'awards', label: 'Recognition', svc: 'awards-svc', key: '5', x: 400, y: 50, blurb: 'Achievements & certifications' },
  { id: 'contact', label: 'Contact', svc: 'egress', key: '6', x: 400, y: 200, blurb: 'Reach me' },
];

export const EDGES = [
  ['gateway', 'experience'],
  ['gateway', 'skills'],
  ['experience', 'projects'],
  ['skills', 'projects'],
  ['projects', 'awards'],
  ['projects', 'contact'],
  ['awards', 'contact'],
];

export const NODE_W = 108;
export const NODE_H = 44;
export const VIEWBOX = { w: 460, h: 250 };

export const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const ORDER = NODES.map((n) => n.id);

const ALIASES = {
  gateway: 'gateway',
  profile: 'gateway',
  about: 'gateway',
  home: 'gateway',
  me: 'gateway',
  experience: 'experience',
  exp: 'experience',
  work: 'experience',
  veqiro: 'experience',
  projects: 'projects',
  project: 'projects',
  repos: 'projects',
  skills: 'skills',
  stack: 'skills',
  tech: 'skills',
  awards: 'awards',
  recognition: 'awards',
  achievements: 'awards',
  certs: 'awards',
  certifications: 'awards',
  contact: 'contact',
  egress: 'contact',
  hire: 'contact',
};

export function resolveNode(word) {
  if (!word) return null;
  const w = word.toLowerCase().replace(/-svc$/, '');
  if (ALIASES[w]) return ALIASES[w];
  const byKey = NODES.find((n) => n.key === w);
  return byKey ? byKey.id : null;
}

const neighbours = (() => {
  const m = Object.fromEntries(ORDER.map((id) => [id, []]));
  for (const [a, b] of EDGES) {
    m[a].push(b);
    m[b].push(a);
  }
  return m;
})();

/** Shortest route between two nodes (BFS), inclusive of both ends. */
export function routeBetween(from, to) {
  if (from === to) return [from];
  const prev = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of neighbours[cur]) {
      if (next in prev) continue;
      prev[next] = cur;
      if (next === to) {
        const path = [to];
        let p = cur;
        while (p) {
          path.unshift(p);
          p = prev[p];
        }
        return path;
      }
      queue.push(next);
    }
  }
  return [from, to];
}

export const edgeKey = (a, b) => [a, b].sort().join('|');
