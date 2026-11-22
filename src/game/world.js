// Tile-based town map for Play mode. Everything is generated from code (no image assets).
export const T = 16; // logical pixels per tile
export const W = 52; // map width in tiles
export const H = 36; // map height in tiles

export const GROUND = { GRASS: 0, PATH: 1, WATER: 2, PLAZA: 3 };

// Buildings occupy x..x+w-1, y..y+h-1. The door is on the south wall; the tile in front of it is the "door step".
export const BUILDINGS = [
  { id: 'about', name: 'Home', icon: '🏠', x: 7, y: 4, w: 7, h: 6, roof: '#c2410c', roofDark: '#9a3412', wall: '#fde7b0', wallDark: '#e9c987' },
  { id: 'experience', name: 'Experience HQ', icon: '🏢', x: 21, y: 4, w: 9, h: 6, roof: '#1d4ed8', roofDark: '#1e3a8a', wall: '#dbe4ef', wallDark: '#b6c3d4' },
  { id: 'projects', name: 'Projects Arcade', icon: '🕹️', x: 36, y: 4, w: 10, h: 6, roof: '#7c3aed', roofDark: '#5b21b6', wall: '#2e2a5a', wallDark: '#1f1b45', neon: true },
  { id: 'skills', name: 'Skills Dojo', icon: '🥋', x: 7, y: 19, w: 8, h: 6, roof: '#b91c1c', roofDark: '#7f1d1d', wall: '#fbf3dc', wallDark: '#e6d6ad' },
  { id: 'contact', name: 'Post Office', icon: '📮', x: 22, y: 19, w: 8, h: 6, roof: '#15803d', roofDark: '#14532d', wall: '#e0f0fb', wallDark: '#bcd6ea' },
  { id: 'trophies', name: 'Trophy Hall', icon: '🏆', x: 36, y: 19, w: 9, h: 6, roof: '#b45309', roofDark: '#78350f', wall: '#fdf6d3', wallDark: '#eadb9c' },
];

export const doorOf = (b) => ({ x: b.x + Math.floor(b.w / 2), y: b.y + b.h });

// Fixed props on the plaza.
export const FOUNTAIN = { x: 25, y: 15, w: 2, h: 2 };
export const CHEST = { x: 21, y: 15 };
export const SIGN = { x: 30, y: 15 };
export const NPC = { x: 23, y: 14 };
export const SPAWN = { x: 27.5 * T, y: 14.9 * T };

export const INTERACTABLES = [
  ...BUILDINGS.map((b) => ({ id: b.id, kind: 'building', ...doorOf(b), reach: 1.0, label: `Enter ${b.name}` })),
  { id: 'chest', kind: 'chest', ...CHEST, reach: 1.6, label: 'Open the chest' },
  { id: 'sign', kind: 'sign', ...SIGN, reach: 1.6, label: 'Read the signboard' },
  { id: 'guide', kind: 'npc', ...NPC, reach: 1.6, label: 'Talk to the guide' },
];

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorld() {
  const ground = new Uint8Array(W * H);
  const solid = new Uint8Array(W * H);
  const reserved = new Uint8Array(W * H);
  const deco = new Array(W * H).fill(null);
  const idx = (x, y) => y * W + x;
  const rect = (x0, y0, x1, y1, fn) => {
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++)
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) fn(idx(x, y), x, y);
  };
  const setGround = (type) => (i) => {
    ground[i] = type;
    reserved[i] = 1;
  };

  // Roads: two east-west streets joined at both ends.
  rect(3, 12, 48, 13, setGround(GROUND.PATH));
  rect(3, 27, 48, 28, setGround(GROUND.PATH));
  rect(3, 12, 4, 28, setGround(GROUND.PATH));
  rect(47, 12, 48, 28, setGround(GROUND.PATH));
  rect(20, 14, 31, 17, setGround(GROUND.PLAZA));

  for (const b of BUILDINGS) {
    const d = doorOf(b);
    const roadY = b.y < 12 ? 11 : 26;
    rect(d.x - 1, d.y, d.x + 1, roadY, setGround(GROUND.PATH));
    rect(b.x - 1, b.y - 1, b.x + b.w, b.y + b.h, (i) => (reserved[i] = 1));
    rect(b.x, b.y, b.x + b.w - 1, b.y + b.h - 1, (i) => (solid[i] = 1));
  }

  // Pond with rounded corners.
  rect(13, 30, 21, 33, (i, x, y) => {
    const corner = (x === 13 || x === 21) && (y === 30 || y === 33);
    if (!corner) {
      ground[i] = GROUND.WATER;
      solid[i] = 1;
    }
    reserved[i] = 1;
  });

  rect(FOUNTAIN.x, FOUNTAIN.y, FOUNTAIN.x + FOUNTAIN.w - 1, FOUNTAIN.y + FOUNTAIN.h - 1, (i) => (solid[i] = 1));
  for (const p of [CHEST, SIGN, NPC]) solid[idx(p.x, p.y)] = 1;

  // Border of trees.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) {
        deco[idx(x, y)] = 'tree';
        solid[idx(x, y)] = 1;
        reserved[idx(x, y)] = 1;
      }

  // Scatter nature on open grass, keeping one tile of clearance around everything built.
  const rng = mulberry32(1862);
  const clear = (x, y) => {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) return false;
        const i = idx(nx, ny);
        if ((reserved[i] && !(deco[i] === 'tree' && (dx || dy))) || ground[i] !== GROUND.GRASS) return false;
      }
    return true;
  };
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++) {
      if (!clear(x, y)) continue;
      const i = idx(x, y);
      const r = rng();
      if (r < 0.1) {
        deco[i] = 'tree';
        solid[i] = 1;
      } else if (r < 0.2) deco[i] = 'flower';
      else if (r < 0.225) {
        deco[i] = 'rock';
        solid[i] = 1;
      } else if (r < 0.26) {
        deco[i] = 'bush';
        solid[i] = 1;
      } else if (r < 0.33) deco[i] = 'tuft';
    }

  return { ground, solid, deco, idx };
}

export function isSolidAt(world, px, py) {
  const tx = Math.floor(px / T);
  const ty = Math.floor(py / T);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
  return world.solid[world.idx(tx, ty)] === 1;
}

// Feet hitbox: 8px wide, 5px tall, anchored at the sprite's feet.
export function collides(world, x, y) {
  return (
    isSolidAt(world, x - 4, y - 5) ||
    isSolidAt(world, x + 3, y - 5) ||
    isSolidAt(world, x - 4, y - 1) ||
    isSolidAt(world, x + 3, y - 1)
  );
}
