import React, { useEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowPathIcon,
  BeakerIcon,
  BoltIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PauseIcon,
  PlayIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import { DRILLS, LEASE_MS, MAX_ATTEMPTS, duplicates, initialState, reducer } from './taskflowSim';

const TICK_MS = 100;
const LEVEL = { INFO: 'text-muted', OK: 'text-ok', WARN: 'text-amber-500', ERR: 'text-red-500' };
const secs = (ms) => `${(Math.max(0, ms) / 1000).toFixed(1)}s`;

const JobChip = ({ job, t }) => {
  const waiting = job.status === 'queued' && job.readyAt > t;
  const cls =
    job.status === 'dlq'
      ? 'border-red-500/40 bg-red-500/10 text-red-500'
      : job.poison
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
        : 'border-line bg-raised text-muted';
  return (
    <li className={`flex items-center justify-between gap-2 rounded-md border px-2 py-1 font-mono text-[11px] ${cls}`}>
      <span>{job.id}</span>
      <span className="text-[10px] opacity-80">
        {waiting ? `backoff ${secs(job.readyAt - t)}` : job.attempts > 0 ? `try ${job.attempts + 1}` : 'ready'}
      </span>
    </li>
  );
};

const WorkerCard = ({ w, state, onKill }) => {
  const job = w.job && state.jobs.find((j) => j.id === w.job);
  const down = w.status === 'down';
  const silent = down && w.job ? state.t - w.lastBeat : 0;
  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        down ? 'border-red-500/40 bg-red-500/5' : w.status === 'busy' ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface'
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[11px]">
        <span className="flex items-center gap-1.5 text-ink">
          <span
            className={`h-1.5 w-1.5 rounded-full ${down ? 'bg-red-500' : w.status === 'busy' ? 'animate-pulse bg-accent' : 'bg-ok'}`}
          />
          {w.id}
        </span>
        <span className={down ? 'text-red-500' : 'text-subtle'}>
          {down ? `restart ${secs(w.downUntil - state.t)}` : w.status}
        </span>
      </div>
      <div className="mt-2 h-10 font-mono text-[11px]">
        {job ? (
          <>
            <div className="flex justify-between text-muted">
              <span className={job.poison ? 'text-amber-500' : ''}>{job.id}</span>
              <span className="text-subtle">fence {w.fence}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised">
              <div
                className={`h-full rounded-full ${down ? 'bg-red-500/60' : job.poison ? 'bg-amber-500' : 'bg-accent'}`}
                style={{ width: `${job.progress * 100}%` }}
              />
            </div>
            {down && <p className="mt-1 text-[10px] text-red-500">no heartbeat {secs(silent)} / lease {secs(LEASE_MS)}</p>}
          </>
        ) : down && w.staleFence != null ? (
          <p className="text-[10px] leading-snug text-subtle">
            still holds fence {w.staleFence} for {w.staleJob}; its commit will be rejected
          </p>
        ) : (
          <p className="text-subtle">{down ? 'offline' : 'waiting for work'}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onKill(w.id)}
        disabled={down}
        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-line py-1 font-mono text-[11px] text-muted transition-colors hover:border-red-500/50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <BoltIcon className="h-3.5 w-3.5" /> kill
      </button>
    </div>
  );
};

const Lab = ({ onEvent }) => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const logRef = useRef(null);
  const reported = useRef({});

  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) dispatch({ type: 'TICK', dt: now - last });
      last = now;
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.log]);

  // Tell the main console when a drill is passed.
  useEffect(() => {
    for (const d of DRILLS) {
      if (state.drills[d.id] && !reported.current[d.id]) {
        reported.current[d.id] = true;
        onEvent?.('OK', `chaos lab: drill passed · ${d.label.toLowerCase()}`);
      }
    }
    if (DRILLS.every((d) => state.drills[d.id]) && !reported.current.all) {
      reported.current.all = true;
      onEvent?.('OK', `chaos lab: all failure drills survived · duplicate commits ${duplicates(state)}`);
    }
  }, [state, onEvent]);

  const queued = state.jobs.filter((j) => j.status === 'queued');
  const dead = state.jobs.filter((j) => j.status === 'dlq');
  const passed = DRILLS.filter((d) => state.drills[d.id]).length;

  const stats = [
    ['committed', state.stats.done],
    ['retries', state.stats.retries],
    ['recovered', state.stats.recovered],
    ['stale writes blocked', state.stats.rejected],
    ['duplicate commits', duplicates(state)],
  ];

  return (
    <div className="space-y-4 border-t border-line p-4 sm:p-6">
      {/* drills */}
      <div className="grid gap-2 sm:grid-cols-3">
        {DRILLS.map((d) => {
          const ok = state.drills[d.id];
          return (
            <div key={d.id} className={`rounded-lg border p-3 ${ok ? 'border-ok/40 bg-ok/5' : 'border-line'}`}>
              <p className={`flex items-center gap-1.5 text-sm font-medium ${ok ? 'text-ok' : 'text-ink'}`}>
                <CheckCircleIcon className={`h-4 w-4 ${ok ? '' : 'text-subtle'}`} /> {d.label}
              </p>
              <p className="mt-1 text-xs leading-snug text-subtle">{d.hint}</p>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => dispatch({ type: 'POISON' })}>
          <BeakerIcon className="h-4 w-4 text-amber-500" /> Inject failure
        </button>
        <button type="button" className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => dispatch({ type: 'BURST' })}>
          <QueueListIcon className="h-4 w-4" /> Burst ×6
        </button>
        <button
          type="button"
          className="btn-ghost !px-3 !py-1.5 !text-xs"
          disabled={!dead.length}
          onClick={() => dispatch({ type: 'REPLAY' })}
        >
          <ArrowPathIcon className="h-4 w-4 text-ok" /> Replay DLQ{dead.length ? ` (${dead.length})` : ''}
        </button>
        <span className="ml-auto flex gap-2">
          <button type="button" className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => dispatch({ type: 'TOGGLE' })}>
            {state.running ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            {state.running ? 'Pause' : 'Resume'}
          </button>
          <button type="button" className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => dispatch({ type: 'RESET' })}>
            Reset
          </button>
        </span>
      </div>

      {/* board */}
      <div className="grid gap-4 xl:grid-cols-[180px_1fr]">
        <div className="order-2 space-y-3 xl:order-none">
          <div>
            <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-subtle">queue · {queued.length}</p>
            <ul className="space-y-1">
              {queued.slice(0, 6).map((j) => (
                <JobChip key={j.id} job={j} t={state.t} />
              ))}
              {queued.length > 6 && <li className="font-mono text-[10px] text-subtle">+{queued.length - 6} more</li>}
              {!queued.length && <li className="font-mono text-[11px] text-subtle">empty</li>}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-subtle">dead-letter · {dead.length}</p>
            <ul className="space-y-1">
              {dead.map((j) => (
                <JobChip key={j.id} job={j} t={state.t} />
              ))}
              {!dead.length && <li className="font-mono text-[11px] text-subtle">empty</li>}
            </ul>
          </div>
        </div>

        <div className="order-1 min-w-0 space-y-3 xl:order-none">
          <div className="grid gap-2 sm:grid-cols-3">
            {state.workers.map((w) => (
              <WorkerCard key={w.id} w={w} state={state} onKill={(id) => dispatch({ type: 'KILL', worker: id })} />
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-line px-3 py-2">
                <dd
                  className={`font-mono text-lg font-semibold ${
                    label === 'duplicate commits' ? (value ? 'text-red-500' : 'text-ok') : 'text-ink'
                  }`}
                >
                  {value}
                </dd>
                <dt className="text-[11px] leading-tight text-subtle">{label}</dt>
              </div>
            ))}
          </dl>
          <div
            ref={logRef}
            className="h-36 overflow-y-auto rounded-lg border border-line bg-bg/60 px-3 py-2 font-mono text-[11px] leading-[1.7]"
            aria-live="off"
          >
            {state.log.map((e) => (
              <div key={e.id} className="flex gap-2">
                <span className="shrink-0 tabular-nums text-subtle/70">{secs(e.t)}</span>
                <span className={LEVEL[e.level]}>{e.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-subtle">
        A browser simulation of TaskFlow's design, not the live service: FIFO claims (Postgres{' '}
        <code className="font-mono">SKIP LOCKED</code>), heartbeat leases swept after {LEASE_MS / 1000}s, exponential
        backoff up to {MAX_ATTEMPTS} attempts, a dead-letter queue, and fencing tokens so a revived worker can never commit
        twice. Drills passed: {passed}/{DRILLS.length}.
      </p>
    </div>
  );
};

/** Collapsible panel; the simulation only runs while it is open. `openSignal` changes to open it from the console. */
const ChaosLab = ({ openSignal, onEvent }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!openSignal) return undefined;
    setOpen(true);
    const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, [openSignal]);

  return (
    <section ref={ref} id="chaos-lab" className="card scroll-mt-24 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-raised/40 sm:px-6"
      >
        <span>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
            <BoltIcon className="h-3.5 w-3.5" /> chaos lab · taskflow
          </span>
          <span className="mt-1 block text-lg font-semibold tracking-tight">Break TaskFlow. Watch it recover.</span>
          <span className="mt-0.5 block text-sm text-muted">
            Kill workers mid-job, inject failures, flood the queue. Every job still commits exactly once.
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {!open && <span className="hidden rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-bg sm:inline">Run it</span>}
          <ChevronDownIcon className={`h-5 w-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Lab onEvent={onEvent} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ChaosLab;
