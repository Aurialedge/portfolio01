import { duplicates, initialState, reducer } from './taskflowSim';

const run = (s, ms) => {
  for (let t = 0; t < ms; t += 100) s = reducer(s, { type: 'TICK', dt: 100 });
  return s;
};

test('steady state commits jobs with no duplicates', () => {
  const s = run(initialState(), 20000);
  expect(s.stats.done).toBeGreaterThan(10);
  expect(duplicates(s)).toBe(0);
});

test('killing a busy worker: lease expires, job is requeued, stale write is fenced off', () => {
  let s = run(initialState(), 3000);
  const busy = s.workers.find((w) => w.status === 'busy');
  const jobId = busy.job;
  s = reducer(s, { type: 'KILL', worker: busy.id });
  expect(s.drills.kill).toBe(true);
  s = run(s, 6000);
  expect(s.drills.fence).toBe(true);
  expect(s.stats.rejected).toBe(1);
  s = run(s, 8000);
  expect(s.commits[jobId]).toBe(1); // the requeued job still committed exactly once
  expect(duplicates(s)).toBe(0);
});

test('a poisoned job exhausts retries, lands in the DLQ, and commits once after replay', () => {
  let s = reducer(initialState(), { type: 'POISON' });
  const jobId = s.jobs.find((j) => j.poison).id;
  s = run(s, 15000);
  expect(s.jobs.find((j) => j.id === jobId).status).toBe('dlq');
  expect(s.stats.retries).toBeGreaterThanOrEqual(3);
  s = reducer(s, { type: 'REPLAY' });
  expect(s.drills.dlq).toBe(true);
  s = run(s, 8000);
  expect(s.commits[jobId]).toBe(1);
  expect(duplicates(s)).toBe(0);
});
