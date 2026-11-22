import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BY_ID, EDGES, NODES, NODE_H, NODE_W, VIEWBOX, edgeKey } from './topology';

export const HOP_SECONDS = 0.32;

const Node = ({ node, active, visited, badge, onRoute }) => {
  const x = node.x - NODE_W / 2;
  const y = node.y - NODE_H / 2;
  const state = active ? 'active' : visited ? 'healthy' : 'unprobed';
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${node.label}: ${node.blurb} (${state})`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onRoute(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRoute(node.id);
        }
      }}
      className="group cursor-pointer outline-none"
    >
      {active && (
        <motion.rect
          x={x - 5}
          y={y - 5}
          width={NODE_W + 10}
          height={NODE_H + 10}
          rx={14}
          className="fill-accent/10 stroke-accent/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={10}
        strokeWidth={active ? 1.8 : 1}
        strokeDasharray={visited || active ? undefined : '4 3'}
        className={`fill-surface transition-colors group-hover:stroke-accent group-focus-visible:stroke-accent ${
          active ? 'stroke-accent' : visited ? 'stroke-ink/25' : 'stroke-subtle/60'
        }`}
      />
      <text x={x + 9} y={y + 13} className="fill-subtle font-mono text-[8.5px]">
        {node.key}
      </text>
      <circle
        cx={x + NODE_W - 10}
        cy={y + 10}
        r={3.2}
        className={active ? 'fill-accent' : visited ? 'fill-ok' : 'fill-none stroke-subtle'}
        strokeWidth={1}
      />
      <text
        x={node.x}
        y={node.y + 1}
        textAnchor="middle"
        className={`font-sans text-[12.5px] font-semibold ${visited || active ? 'fill-ink' : 'fill-muted'}`}
      >
        {node.label}
      </text>
      <text x={node.x} y={node.y + 14} textAnchor="middle" className="fill-subtle font-mono text-[8.5px]">
        {node.svc}
        {badge != null ? ` · ${badge}` : ''}
      </text>
    </g>
  );
};

const TopologyMap = ({ active, visited, flight, badges, onRoute }) => {
  const reduce = useReducedMotion();
  const hot = new Set();
  if (flight) for (let i = 1; i < flight.path.length; i++) hot.add(edgeKey(flight.path[i - 1], flight.path[i]));
  const pts = flight ? flight.path.map((id) => BY_ID[id]) : [];

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      className="block h-auto w-full select-none"
      role="group"
      aria-label="Portfolio map. Each node is a section."
    >
      <defs>
        <pattern id="topo-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" className="fill-line" />
        </pattern>
      </defs>
      <rect width={VIEWBOX.w} height={VIEWBOX.h} fill="url(#topo-dots)" />

      {EDGES.map(([a, b]) => {
        const A = BY_ID[a];
        const B = BY_ID[b];
        const isHot = hot.has(edgeKey(a, b));
        const known = visited.has(a) && visited.has(b);
        return (
          <line
            key={edgeKey(a, b)}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            strokeWidth={isHot ? 2 : 1.2}
            strokeDasharray={known || isHot ? undefined : '3 4'}
            className={`transition-colors duration-300 ${isHot ? 'stroke-accent' : known ? 'stroke-ink/25' : 'stroke-subtle/40'}`}
          />
        );
      })}

      {NODES.map((n) => (
        <Node
          key={n.id}
          node={n}
          active={n.id === active}
          visited={visited.has(n.id)}
          badge={badges[n.id]}
          onRoute={onRoute}
        />
      ))}

      {flight && pts.length > 1 && !reduce && (
        <motion.circle
          key={flight.id}
          r={4.5}
          className="fill-accent"
          style={{ filter: 'drop-shadow(0 0 4px rgb(var(--accent)))' }}
          initial={{ cx: pts[0].x, cy: pts[0].y, opacity: 1 }}
          animate={{ cx: pts.map((p) => p.x), cy: pts.map((p) => p.y), opacity: [...pts.slice(1).map(() => 1), 0] }}
          transition={{ duration: (pts.length - 1) * HOP_SECONDS, ease: 'easeInOut' }}
        />
      )}
    </svg>
  );
};

export default TopologyMap;
