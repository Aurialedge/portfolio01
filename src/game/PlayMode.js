import React, { useCallback, useEffect, useRef, useState } from 'react';
import { T, W, H, BUILDINGS, INTERACTABLES, CHEST, NPC, FOUNTAIN, SPAWN, createWorld, collides, doorOf } from './world';
import { renderStatic, drawFountain, drawChest, drawCharacter, drawGuide, drawBubble, drawDoorGlow } from './sprites';
import { PANELS } from './Panels';
import VideoModal from '../components/VideoModal';
import { profile } from '../data/profile';

const STORAGE_KEY = 'play-progress-v1';
const XP_PER_LEVEL = 140;
const TOTAL_XP = BUILDINGS.length * 100 + 50 + 25 + 25;
const TITLES = ['Visitor', 'Explorer', 'Adventurer', 'Pathfinder', 'Hero', 'Legend'];
const levelOf = (xp) => Math.min(TITLES.length, 1 + Math.floor(xp / XP_PER_LEVEL));

const INTRO = [
  `Welcome to ${profile.name.split(' ')[0]}'s town, traveler! I'm the guide.`,
  'Move with WASD or the arrow keys (on a phone, use the D-pad). Hold Shift to run.',
  'Walk up to a glowing door and press E to step inside. Every building holds part of the story.',
  'Visit all six buildings to finish the quest. And psst… there is a treasure chest on the plaza.',
];
const AGAIN = [
  'Back again? Press M any time to open the map and fast-travel.',
  'The Projects Arcade updates itself from GitHub, so new cabinets appear whenever a repo is pushed.',
];

const KEYMAP = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
};
const ACTION_KEYS = ['e', 'E', 'Enter', ' '];

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (p && Array.isArray(p.opened)) return p;
  } catch {
    /* storage unavailable */
  }
  return { opened: [], xp: 0, introSeen: false, completed: false };
}

function useSfx(enabled) {
  const ctxRef = useRef(null);
  return useCallback(
    (kind) => {
      if (!enabled) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ac = (ctxRef.current = ctxRef.current || new AC());
        const notes = { xp: [660, 880, 1320], open: [392, 523], blip: [740], level: [523, 659, 784, 1046], win: [523, 659, 784, 1046, 1318] }[kind];
        notes.forEach((f, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'square';
          o.frequency.value = f;
          const t = ac.currentTime + i * 0.075;
          g.gain.setValueAtTime(0.04, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
          o.connect(g).connect(ac.destination);
          o.start(t);
          o.stop(t + 0.13);
        });
      } catch {
        /* audio unavailable */
      }
    },
    [enabled]
  );
}

const PixelBox = ({ className = '', children }) => (
  <div className={`border-4 border-stone-900 bg-stone-900/90 shadow-[inset_0_0_0_2px_#57534e] ${className}`}>{children}</div>
);

const Key = ({ children }) => (
  <kbd className="mx-0.5 inline-block border-2 border-stone-500 bg-stone-800 px-1 font-pixel text-[8px] leading-4 text-stone-100">{children}</kbd>
);

function Dialog({ dialog, onAdvance, touch }) {
  const line = dialog.lines[dialog.i];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const id = setInterval(() => setShown((n) => (n >= line.length ? n : n + 1)), 18);
    return () => clearInterval(id);
  }, [line]);
  const done = shown >= line.length;
  return (
    <button
      type="button"
      onClick={() => (done ? onAdvance() : setShown(line.length))}
      className="absolute inset-x-3 bottom-28 mx-auto block max-w-2xl text-left sm:bottom-8"
    >
      <PixelBox className="flex gap-3 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center border-2 border-emerald-400 bg-emerald-900 text-2xl">🧭</span>
        <span className="min-h-[3.5rem] flex-1">
          <span className="font-pixel text-[9px] uppercase text-emerald-300">Guide</span>
          <span className="mt-2 block text-sm leading-relaxed text-white">{line.slice(0, shown)}</span>
        </span>
      </PixelBox>
      <span className="mt-1 block text-right font-pixel text-[8px] text-white/80">
        {done ? (dialog.i < dialog.lines.length - 1 ? '▼ next' : '▼ close') : '…'} {touch ? '(tap)' : <Key>E</Key>}
      </span>
    </button>
  );
}

function DPad({ onPress, onAction, actionLabel }) {
  const bind = (dir) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      onPress(dir, true);
    },
    onPointerUp: () => onPress(dir, false),
    onPointerCancel: () => onPress(dir, false),
    onLostPointerCapture: () => onPress(dir, false),
  });
  const pad = 'absolute grid h-14 w-14 place-items-center border-4 border-stone-900 bg-stone-800/85 text-lg text-white active:bg-stone-600';
  return (
    <>
      <div className="absolute bottom-5 left-4 h-[10.5rem] w-[10.5rem] touch-none select-none">
        <button aria-label="Up" className={`${pad} left-14 top-0`} {...bind('up')}>▲</button>
        <button aria-label="Left" className={`${pad} left-0 top-14`} {...bind('left')}>◀</button>
        <button aria-label="Right" className={`${pad} right-0 top-14`} {...bind('right')}>▶</button>
        <button aria-label="Down" className={`${pad} bottom-0 left-14`} {...bind('down')}>▼</button>
      </div>
      <button
        aria-label={actionLabel || 'Action'}
        onPointerDown={(e) => {
          e.preventDefault();
          onAction();
        }}
        className={`absolute bottom-12 right-6 grid h-20 w-20 touch-none select-none place-items-center rounded-full border-4 border-stone-900 font-pixel text-lg text-stone-900 ${
          actionLabel ? 'animate-pulse bg-amber-400' : 'bg-stone-400/70'
        }`}
      >
        A
      </button>
    </>
  );
}

export default function PlayMode({ github, onExit }) {
  const canvasRef = useRef(null);
  const miniRef = useRef(null);
  const game = useRef({ x: SPAWN.x, y: SPAWN.y, dir: 'down', moving: false, run: false, step: 0, stepT: 0, keys: new Set() });

  const [progress, setProgress] = useState(loadProgress);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const [nearby, setNearby] = useState(null);
  const nearbyRef = useRef(null);
  const [panel, setPanel] = useState(null);
  const [dialog, setDialog] = useState(() => (progress.introSeen ? null : { lines: INTRO, i: 0, intro: true }));
  const [menu, setMenu] = useState(false);
  const [video, setVideo] = useState(null);
  const [complete, setComplete] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sound, setSound] = useState(true);
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const sfx = useSfx(sound);

  const paused = Boolean(panel || dialog || menu || video || complete);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    if (paused) game.current.keys.clear();
  }, [paused]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
  }, [progress]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toast = useCallback((text, tone = 'xp') => {
    const id = Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const award = useCallback(
    (key, amount, label) => {
      const p = progressRef.current;
      if (p.opened.includes(key)) return;
      const xp = p.xp + amount;
      const next = { ...p, opened: [...p.opened, key], xp };
      progressRef.current = next;
      setProgress(next);
      toast(`+${amount} XP · ${label}`);
      if (levelOf(xp) > levelOf(p.xp)) {
        setTimeout(() => {
          toast(`Level up! You are now a ${TITLES[levelOf(xp) - 1]}`, 'level');
          sfx('level');
        }, 450);
      } else sfx('xp');
    },
    [sfx, toast]
  );

  const visitedCount = BUILDINGS.filter((b) => progress.opened.includes(`b:${b.id}`)).length;

  const interact = useCallback(
    (it) => {
      if (!it) return;
      if (it.kind === 'building') {
        const b = BUILDINGS.find((x) => x.id === it.id);
        sfx('open');
        setPanel(it.id);
        award(`b:${it.id}`, 100, `Discovered ${b.name}`);
      } else if (it.kind === 'chest') {
        setPanel('chest');
        award('chest', 50, 'Found the treasure chest');
      } else if (it.kind === 'sign') {
        setPanel('sign');
        award('sign', 25, 'Read the notice board');
      } else if (it.kind === 'npc') {
        sfx('blip');
        setDialog({ lines: progressRef.current.opened.includes('npc') ? AGAIN : INTRO, i: 0 });
        award('npc', 25, 'Met the guide');
      }
    },
    [award, sfx]
  );
  const interactRef = useRef(interact);
  interactRef.current = interact;

  const closePanel = useCallback(() => {
    setPanel(null);
    const p = progressRef.current;
    const all = BUILDINGS.every((b) => p.opened.includes(`b:${b.id}`));
    if (all && !p.completed) {
      setProgress({ ...p, completed: true });
      setComplete(true);
      sfx('win');
    }
  }, [sfx]);

  const advanceDialog = useCallback(() => {
    setDialog((d) => {
      if (!d) return d;
      if (d.i < d.lines.length - 1) return { ...d, i: d.i + 1 };
      if (d.intro) setProgress((p) => ({ ...p, introSeen: true }));
      return null;
    });
  }, []);

  const fastTravel = (b) => {
    const d = doorOf(b);
    Object.assign(game.current, { x: (d.x + 0.5) * T, y: (d.y + 0.85) * T, dir: 'up' });
    setMenu(false);
    interact({ id: b.id, kind: 'building' });
  };

  // Keyboard.
  const stateRef = useRef({});
  stateRef.current = { panel, dialog, menu, video, complete };
  useEffect(() => {
    const onDown = (e) => {
      const s = stateRef.current;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === 'Escape') {
        if (s.video) return; // VideoModal handles its own Escape
        if (s.panel) closePanel();
        else if (s.menu) setMenu(false);
        else if (s.complete) setComplete(false);
        else if (s.dialog) setDialog(null);
        else onExit();
        return;
      }
      if (typing) return;
      if (s.dialog && ACTION_KEYS.includes(e.key)) {
        e.preventDefault();
        advanceDialog();
        return;
      }
      if (pausedRef.current) return;
      const dir = KEYMAP[e.key];
      if (dir) {
        e.preventDefault();
        game.current.keys.add(dir);
      } else if (e.key === 'Shift') game.current.run = true;
      else if (ACTION_KEYS.includes(e.key)) {
        e.preventDefault();
        interactRef.current(nearbyRef.current);
      } else if (e.key === 'm' || e.key === 'M') setMenu(true);
    };
    const onUp = (e) => {
      const dir = KEYMAP[e.key];
      if (dir) game.current.keys.delete(dir);
      if (e.key === 'Shift') game.current.run = false;
    };
    const onBlur = () => game.current.keys.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [advanceDialog, closePanel, onExit]);

  // Game loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const world = createWorld();
    const layer = renderStatic(world);
    const g = game.current;
    let scale = 3;
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let last = performance.now();
    let lastNear = null;

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      cssW = r.width;
      cssH = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      scale = Math.max(2, Math.min(5, Math.floor(Math.min(cssW / (T * 26), cssH / (T * 15)))));
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;

      if (!pausedRef.current) {
        let dx = 0;
        let dy = 0;
        if (g.keys.has('left')) dx -= 1;
        if (g.keys.has('right')) dx += 1;
        if (g.keys.has('up')) dy -= 1;
        if (g.keys.has('down')) dy += 1;
        g.moving = Boolean(dx || dy);
        if (g.moving) {
          g.dir = dx ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
          const len = Math.hypot(dx, dy);
          const sp = (g.run ? 150 : 90) * dt;
          const nx = g.x + (dx / len) * sp;
          const ny = g.y + (dy / len) * sp;
          if (!collides(world, nx, g.y)) g.x = nx;
          if (!collides(world, g.x, ny)) g.y = ny;
          g.stepT += dt * (g.run ? 1.6 : 1);
          if (g.stepT > 0.14) {
            g.stepT = 0;
            g.step += 1;
          }
        }
      } else g.moving = false;

      let near = null;
      let best = Infinity;
      for (const it of INTERACTABLES) {
        const d = Math.hypot(g.x - (it.x + 0.5) * T, g.y - 4 - (it.y + 0.5) * T) / T;
        if (d < it.reach && d < best) {
          best = d;
          near = it;
        }
      }
      if (near !== lastNear) {
        lastNear = near;
        nearbyRef.current = near;
        setNearby(near);
      }

      // Camera follows the player, clamped to the map.
      const vw = cssW / scale;
      const vh = cssH / scale;
      const ww = W * T;
      const wh = H * T;
      let cx = vw >= ww ? (ww - vw) / 2 : Math.max(0, Math.min(ww - vw, g.x - vw / 2));
      let cy = vh >= wh ? (wh - vh) / 2 : Math.max(0, Math.min(wh - vh, g.y - 8 - vh / 2));
      cx = Math.round(cx * scale) / scale;
      cy = Math.round(cy * scale) / scale;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#1f3b1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const s = scale * dpr;
      ctx.setTransform(s, 0, 0, s, -cx * s, -cy * s);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(layer, 0, 0);
      if (near && near.kind === 'building' && !pausedRef.current) drawDoorGlow(ctx, near.x, near.y, time);

      const prog = progressRef.current;
      const gx = (NPC.x + 0.5) * T;
      const gy = (NPC.y + 1) * T - 1;
      const toPlayer =
        Math.abs(g.x - gx) > Math.abs(g.y - gy) ? (g.x < gx ? 'left' : 'right') : g.y < gy ? 'up' : 'down';
      const sprites = [
        { y: (FOUNTAIN.y + FOUNTAIN.h) * T, draw: () => drawFountain(ctx, time) },
        { y: (CHEST.y + 1) * T, draw: () => drawChest(ctx, CHEST.x, CHEST.y, prog.opened.includes('chest'), time) },
        {
          y: gy,
          draw: () => {
            drawGuide(ctx, gx, gy, toPlayer);
            if (!prog.opened.includes('npc')) drawBubble(ctx, gx, gy, time);
          },
        },
        { y: g.y, draw: () => drawCharacter(ctx, g.x, g.y, g.dir, g.step, g.moving) },
      ].sort((a, b) => a.y - b.y);
      sprites.forEach((sp) => sp.draw());

      // Name plates in screen space so text stays sharp.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fontPx = scale >= 4 ? 10 : 8;
      ctx.font = `${fontPx}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const b of BUILDINGS) {
        const sx = (b.x * T + (b.w * T) / 2 - cx) * scale;
        const sy = (b.y * T - cy) * scale - fontPx - 6;
        if (sx < -200 || sx > cssW + 200 || sy < -30 || sy > cssH + 30) continue;
        const visited = prog.opened.includes(`b:${b.id}`);
        const text = `${visited ? '✔ ' : ''}${b.name}`;
        const tw = ctx.measureText(text).width + 16;
        ctx.fillStyle = 'rgba(20, 16, 36, 0.82)';
        ctx.fillRect(Math.round(sx - tw / 2), Math.round(sy - fontPx), Math.round(tw), fontPx * 2);
        ctx.fillStyle = visited ? '#86efac' : '#fde68a';
        ctx.fillText(text, Math.round(sx), Math.round(sy + 1));
      }

      // Minimap.
      const mini = miniRef.current;
      if (mini) {
        const m = mini.getContext('2d');
        const k = mini.width / ww;
        m.imageSmoothingEnabled = true;
        m.drawImage(layer, 0, 0, mini.width, mini.height);
        m.strokeStyle = 'rgba(255,255,255,0.9)';
        m.lineWidth = 1;
        m.strokeRect(cx * k + 0.5, cy * k + 0.5, vw * k, vh * k);
        for (const b of BUILDINGS) {
          const d = doorOf(b);
          m.fillStyle = prog.opened.includes(`b:${b.id}`) ? '#22c55e' : '#facc15';
          m.fillRect(d.x * T * k - 2, d.y * T * k - 2, 4, 4);
        }
        if (Math.floor(time * 3) % 2) {
          m.fillStyle = '#ef4444';
          m.fillRect(g.x * k - 2, g.y * k - 3, 4, 4);
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const level = levelOf(progress.xp);
  const levelXp = progress.xp - (level - 1) * XP_PER_LEVEL;
  const maxed = level >= TITLES.length;
  const Panel = panel ? PANELS[panel] : null;
  const nearLabel = nearby && !paused ? nearby.label : '';

  return (
    <div className="fixed inset-0 z-[55] select-none bg-[#1f3b1a] font-sans text-white" role="application" aria-label="Portfolio game">
      <canvas ref={canvasRef} className="absolute inset-0 block [image-rendering:pixelated]" aria-hidden="true" />

      {/* HUD: player card */}
      <PixelBox className="absolute left-3 top-3 w-[9.5rem] p-2 sm:w-64 sm:p-2.5">
        <div className="flex items-center justify-between">
          <p className="font-pixel text-[9px] text-amber-300">
            LV {level} · {TITLES[level - 1].toUpperCase()}
          </p>
          <p className="hidden font-pixel text-[8px] text-stone-400 sm:block">
            {progress.xp}/{TOTAL_XP}
          </p>
        </div>
        <div className="mt-2 h-2.5 border-2 border-stone-950 bg-stone-700">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
            style={{ width: `${maxed ? 100 : (levelXp / XP_PER_LEVEL) * 100}%` }}
          />
        </div>
        <p className="mt-2 font-pixel text-[8px] leading-relaxed text-stone-300">
          QUEST<span className="hidden sm:inline">: visit buildings</span> {visitedCount}/{BUILDINGS.length}
        </p>
      </PixelBox>

      {/* HUD: buttons + minimap */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button onClick={() => setMenu(true)} className="border-4 border-stone-900 bg-stone-800 px-2 py-1.5 font-pixel text-[8px] sm:px-2.5 sm:text-[9px] hover:bg-stone-700" title="Map (M)">
            MAP
          </button>
          <button
            onClick={() => setSound((s) => !s)}
            className="border-4 border-stone-900 bg-stone-800 px-2 py-1.5 font-pixel text-[8px] sm:px-2.5 sm:text-[9px] hover:bg-stone-700"
            aria-label={sound ? 'Mute sound' : 'Unmute sound'}
          >
            {sound ? '♪ ON' : '♪ OFF'}
          </button>
          <button onClick={onExit} className="border-4 border-stone-900 bg-rose-700 px-2 py-1.5 font-pixel text-[8px] sm:px-2.5 sm:text-[9px] hover:bg-rose-600" title="Exit (Esc)">
            EXIT
          </button>
        </div>
        <PixelBox className="hidden p-1 sm:block">
          <canvas ref={miniRef} width={W * 3} height={H * 3} className="block" aria-hidden="true" />
        </PixelBox>
      </div>

      {/* Toasts */}
      <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center gap-2 sm:top-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-[toast_2.6s_ease-out_forwards] border-4 border-stone-900 px-3 py-2 font-pixel text-[9px] ${
              t.tone === 'level' ? 'bg-fuchsia-600 text-white' : 'bg-amber-400 text-stone-900'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Interaction prompt */}
      {nearLabel && (
        <div className="pointer-events-none absolute inset-x-0 bottom-36 flex justify-center sm:bottom-10">
          <PixelBox className="px-3 py-2 font-pixel text-[9px]">
            {touch ? 'TAP A' : <Key>E</Key>} {nearLabel.toUpperCase()}
          </PixelBox>
        </div>
      )}

      {/* Controls hint (desktop) */}
      {!touch && (
        <p className="pointer-events-none absolute bottom-3 left-3 hidden font-pixel text-[8px] leading-loose text-white/80 md:block">
          <Key>WASD</Key>/<Key>↑↓←→</Key> move · <Key>SHIFT</Key> run · <Key>E</Key> interact · <Key>M</Key> map · <Key>ESC</Key> exit
        </p>
      )}

      {touch && !paused && (
        <DPad
          onPress={(dir, on) => (on ? game.current.keys.add(dir) : game.current.keys.delete(dir))}
          onAction={() => interact(nearbyRef.current)}
          actionLabel={nearby?.label}
        />
      )}

      {dialog && <Dialog dialog={dialog} onAdvance={advanceDialog} touch={touch} />}

      {/* Map / fast travel */}
      {menu && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 p-4" onClick={() => setMenu(false)}>
          <PixelBox className="w-full max-w-md p-5">
            <div onClick={(e) => e.stopPropagation()}>
              <p className="font-pixel text-xs text-amber-300">WORLD MAP · FAST TRAVEL</p>
              <ul className="mt-4 space-y-2">
                {BUILDINGS.map((b) => {
                  const done = progress.opened.includes(`b:${b.id}`);
                  return (
                    <li key={b.id}>
                      <button
                        onClick={() => fastTravel(b)}
                        className="flex w-full items-center gap-3 border-2 border-stone-600 bg-stone-800 px-3 py-2.5 text-left hover:border-amber-300"
                      >
                        <span className="text-xl">{b.icon}</span>
                        <span className="flex-1 text-sm">{b.name}</span>
                        <span className={`font-pixel text-[8px] ${done ? 'text-emerald-400' : 'text-stone-500'}`}>{done ? 'VISITED' : 'NEW'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button onClick={() => setMenu(false)} className="mt-4 w-full border-2 border-stone-600 py-2 font-pixel text-[9px] hover:bg-stone-800">
                BACK TO GAME
              </button>
            </div>
          </PixelBox>
        </div>
      )}

      {/* Building interior */}
      {Panel && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 p-3 sm:p-6" onClick={closePanel}>
          <PixelBox className="flex max-h-[88vh] w-full max-w-2xl flex-col">
            <div className="flex min-h-0 flex-1 flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={Panel.title}>
              <div className="flex items-center justify-between border-b-4 border-stone-800 bg-stone-800/70 px-4 py-3">
                <p className="font-pixel text-[11px] text-white">{Panel.title}</p>
                <button onClick={closePanel} className="border-2 border-stone-500 px-2 py-1 font-pixel text-[8px] hover:bg-stone-700">
                  ESC ✕
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <Panel.Component github={github} onPlay={setVideo} />
              </div>
            </div>
          </PixelBox>
        </div>
      )}

      {/* Quest complete */}
      {complete && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 p-4">
          <PixelBox className="w-full max-w-md p-6 text-center">
            <p className="text-5xl">🏆</p>
            <p className="mt-4 font-pixel text-sm leading-relaxed text-amber-300">QUEST COMPLETE!</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              You explored every corner of {profile.name}'s town. Final rank: <span className="text-white">{TITLES[level - 1]}</span>.
              Ready for the boss level? Send an offer.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href={`mailto:${profile.email}`} className="border-4 border-stone-900 bg-amber-400 py-2.5 font-pixel text-[10px] text-stone-900 hover:bg-amber-300">
                ✉ EMAIL SHIVRAJ
              </a>
              <a href={profile.resume} download className="border-4 border-stone-900 bg-stone-700 py-2.5 font-pixel text-[10px] hover:bg-stone-600">
                ⬇ DOWNLOAD RESUME
              </a>
              <button onClick={() => setComplete(false)} className="py-2 font-pixel text-[9px] text-stone-400 hover:text-white">
                KEEP EXPLORING
              </button>
            </div>
          </PixelBox>
        </div>
      )}

      <VideoModal video={video} onClose={() => setVideo(null)} />
    </div>
  );
}
