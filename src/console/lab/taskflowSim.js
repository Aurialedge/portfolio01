// A small in-browser simulation of TaskFlow's delivery guarantees, for the "chaos lab".
// Pure reducer: the component just dispatches TICK every ~100 ms and renders the state.
//
// Modelled on the real project:
//   claim     FIFO claim of the oldest ready job (SKIP LOCKED in Postgres), bumps a global fencing token
//   lease     busy workers heartbeat; a sweeper requeues jobs whose worker missed the lease
//   retry     failures retry with exponential backoff, then land in the dead-letter queue
//   fencing   a worker that comes back with an old token cannot commit, so no job is applied twice

export const WORKERS = ['w1', 'w2', 'w3'];
export const LEASE_MS = 1200;
export const RESTART_MS = 2800;
export const BASE_BACKOFF_MS = 800;
export const MAX_ATTEMPTS = 3;
const ENQUEUE_EVERY_MS = 900;
const TARGET_BACKLOG = 4;
const POISON_FAILS_AT = 0.6;
const LOG_LIMIT = 40;
const KEEP_DONE = 6;

export const DRILLS = [
  { id: 'kill', label: 'Kill a busy worker', hint: 'its lease expires and the sweeper requeues the job' },
  { id: 'fence', label: 'Stale write rejected', hint: 'the killed worker returns with an old fencing token' },
  { id: 'dlq', label: 'Replay from the DLQ', hint: 'inject a failure, let it exhaust retries, then replay it' },
];

export function initialState() {
  return {
    t: 0,
    running: true,
    seq: 100,
    fence: 0,
    lastEnqueue: -Infinity,
    jobs: [],
    workers: WORKERS.map((id) => ({ id, status: 'idle', job: null, fence: null, lastBeat: 0, downUntil: 0, staleFence: null, staleJob: null })),
    commits: {},
    stats: { done: 0, retries: 0, recovered: 0, rejected: 0 },
    drills: { kill: false, fence: false, dlq: false },
    log: [],
    logSeq: 0,
  };
}

const clone = (s) => ({
  ...s,
  jobs: s.jobs.map((j) => ({ ...j })),
  workers: s.workers.map((w) => ({ ...w })),
  commits: { ...s.commits },
  stats: { ...s.stats },
  drills: { ...s.drills },
  log: s.log.slice(-LOG_LIMIT),
});

function log(s, level, msg) {
  s.logSeq += 1;
  s.log.push({ id: s.logSeq, t: s.t, level, msg });
}

function enqueue(s, { poison = false } = {}) {
  s.seq += 1;
  const job = {
    id: `job-${s.seq}`,
    status: 'queued',
    attempts: 0,
    readyAt: s.t,
    worker: null,
    fence: null,
    progress: 0,
    dur: 1500 + ((s.seq * 7919) % 1100), // deterministic spread, 1.5–2.6 s
    poison,
  };
  s.jobs.push(job);
  s.lastEnqueue = s.t;
  return job;
}

const backoff = (attempts) => BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1);

function requeueOrDLQ(s, job, reason) {
  s.stats.retries += 1;
  if (job.attempts >= MAX_ATTEMPTS) {
    Object.assign(job, { status: 'dlq', worker: null, fence: null, progress: 0 });
    log(s, 'ERR', `${job.id} ${reason} · attempt ${job.attempts}/${MAX_ATTEMPTS} → dead-letter queue`);
    return;
  }
  const wait = backoff(job.attempts);
  Object.assign(job, { status: 'queued', readyAt: s.t + wait, worker: null, fence: null, progress: 0 });
  log(s, 'WARN', `${job.id} ${reason} · retry ${job.attempts + 1}/${MAX_ATTEMPTS} in ${(wait / 1000).toFixed(1)}s`);
}

function tick(s, dt) {
  s.t += dt;

  // Keep a steady trickle of work.
  const backlog = s.jobs.filter((j) => j.status === 'queued').length;
  if (backlog < TARGET_BACKLOG && s.t - s.lastEnqueue >= ENQUEUE_EVERY_MS) enqueue(s);

  for (const w of s.workers) {
    // Restarted workers come back; if they still hold an old token, their commit is fenced off.
    if (w.status === 'down' && s.t >= w.downUntil) {
      w.status = 'idle';
      if (w.staleFence != null) {
        s.stats.rejected += 1;
        s.drills.fence = true;
        log(s, 'OK', `${w.id} restarted, tried to commit ${w.staleJob} with fence ${w.staleFence} → rejected (lease lost, current ${s.fence})`);
        w.staleFence = null;
        w.staleJob = null;
      } else {
        log(s, 'INFO', `${w.id} restarted, rejoined pool`);
      }
    }

    if (w.status !== 'busy') continue;
    const job = s.jobs.find((j) => j.id === w.job);
    if (!job) {
      Object.assign(w, { status: 'idle', job: null, fence: null });
      continue;
    }
    w.lastBeat = s.t;
    job.progress = Math.min(1, job.progress + dt / job.dur);

    if (job.poison && job.progress >= POISON_FAILS_AT) {
      Object.assign(w, { status: 'idle', job: null, fence: null });
      requeueOrDLQ(s, job, 'failed: upstream 503');
      continue;
    }
    if (job.progress >= 1) {
      s.commits[job.id] = (s.commits[job.id] || 0) + 1;
      s.stats.done += 1;
      if (job.attempts > 1) s.stats.recovered += 1;
      Object.assign(job, { status: 'done', worker: null, doneAt: s.t });
      Object.assign(w, { status: 'idle', job: null, fence: null });
      log(s, job.attempts > 1 ? 'OK' : 'INFO', `${job.id} committed by ${w.id} · fence ${job.fence}${job.attempts > 1 ? ` · recovered after ${job.attempts} attempts` : ''}`);
    }
  }

  // Sweeper: a job whose worker stopped heartbeating loses its lease.
  for (const w of s.workers) {
    if (w.status !== 'down' || !w.job) continue;
    if (s.t - w.lastBeat < LEASE_MS) continue;
    const job = s.jobs.find((j) => j.id === w.job);
    w.staleFence = w.fence;
    w.staleJob = w.job;
    w.job = null;
    w.fence = null;
    if (job && job.status === 'running') requeueOrDLQ(s, job, `lease expired (${w.id} silent ${LEASE_MS / 1000}s), sweeper requeued`);
  }

  // Claim: every idle worker takes the oldest ready job.
  for (const w of s.workers) {
    if (w.status !== 'idle') continue;
    const job = s.jobs.find((j) => j.status === 'queued' && j.readyAt <= s.t);
    if (!job) break;
    s.fence += 1;
    job.attempts += 1;
    Object.assign(job, { status: 'running', worker: w.id, fence: s.fence, progress: 0 });
    Object.assign(w, { status: 'busy', job: job.id, fence: s.fence, lastBeat: s.t });
    log(s, 'INFO', `${w.id} claimed ${job.id} · fence ${s.fence}${job.attempts > 1 ? ` · attempt ${job.attempts}` : ''}`);
  }

  // Forget old committed jobs so the board stays small.
  const done = s.jobs.filter((j) => j.status === 'done');
  if (done.length > KEEP_DONE) {
    const drop = new Set(done.slice(0, done.length - KEEP_DONE).map((j) => j.id));
    s.jobs = s.jobs.filter((j) => !drop.has(j.id));
  }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      if (!state.running) return state;
      const s = clone(state);
      tick(s, Math.min(action.dt, 250));
      return s;
    }
    case 'KILL': {
      const s = clone(state);
      const w = s.workers.find((x) => x.id === action.worker);
      if (!w || w.status === 'down') return state;
      const busy = w.status === 'busy';
      Object.assign(w, { status: 'down', downUntil: s.t + RESTART_MS });
      if (busy) s.drills.kill = true;
      log(s, 'ERR', busy ? `${w.id} killed (SIGKILL) while holding ${w.job} · heartbeats stop` : `${w.id} killed while idle`);
      return s;
    }
    case 'POISON': {
      const s = clone(state);
      let job = s.jobs.find((j) => j.status === 'queued' && !j.poison);
      if (job) job.poison = true;
      else job = enqueue(s, { poison: true });
      log(s, 'WARN', `fault injected: ${job.id} will fail every attempt`);
      return s;
    }
    case 'BURST': {
      const s = clone(state);
      for (let i = 0; i < 6; i++) enqueue(s);
      log(s, 'INFO', 'burst: 6 jobs enqueued');
      return s;
    }
    case 'REPLAY': {
      const dead = state.jobs.filter((j) => j.status === 'dlq');
      if (!dead.length) return state;
      const s = clone(state);
      for (const j of s.jobs) {
        if (j.status !== 'dlq') continue;
        Object.assign(j, { status: 'queued', attempts: 0, readyAt: s.t, poison: false });
        log(s, 'OK', `${j.id} replayed from DLQ (fix deployed)`);
      }
      s.drills.dlq = true;
      return s;
    }
    case 'TOGGLE':
      return { ...state, running: !state.running };
    case 'RESET':
      return { ...initialState(), drills: state.drills };
    default:
      return state;
  }
}

export const duplicates = (s) => Object.values(s.commits).filter((n) => n > 1).length;
