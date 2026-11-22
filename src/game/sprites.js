// Procedural pixel art. All coordinates are logical pixels; the canvas is scaled by an integer factor.
import { T, W, H, GROUND, BUILDINGS, FOUNTAIN, SIGN, doorOf } from './world';

const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const px = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

// Filled circle made of 1px rows, so it stays crisp when scaled.
const disc = (ctx, cx, cy, r, color) => {
  ctx.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
};

const C = {
  grass: '#7cc95b',
  grassDark: '#62b046',
  grassLight: '#95d977',
  path: '#e4c58f',
  pathDark: '#c9a46b',
  pathEdge: '#d6b47c',
  plaza: '#d9d4cc',
  plazaLine: '#b5ada2',
  water: '#4b9be6',
  waterDark: '#2f74c0',
  waterLight: '#9fd0ff',
  shadow: 'rgba(0,0,0,0.22)',
};

function drawGround(ctx, world, x, y) {
  const t = world.ground[world.idx(x, y)];
  const X = x * T;
  const Y = y * T;
  if (t === GROUND.GRASS) {
    px(ctx, X, Y, T, T, C.grass);
    for (let k = 0; k < 3; k++) {
      const hx = Math.floor(hash(x, y, k) * 14) + 1;
      const hy = Math.floor(hash(y, x, k) * 13) + 1;
      px(ctx, X + hx, Y + hy, 1, 2, k === 2 ? C.grassLight : C.grassDark);
    }
  } else if (t === GROUND.PATH) {
    px(ctx, X, Y, T, T, C.path);
    for (let k = 0; k < 4; k++) {
      px(ctx, X + Math.floor(hash(x, y, k + 9) * 15), Y + Math.floor(hash(y, x, k + 9) * 15), 1, 1, C.pathDark);
    }
    // Soft edge where the path meets grass.
    const isPath = (nx, ny) =>
      nx >= 0 && ny >= 0 && nx < W && ny < H && world.ground[world.idx(nx, ny)] !== GROUND.GRASS;
    if (!isPath(x, y - 1)) px(ctx, X, Y, T, 1, C.pathEdge);
    if (!isPath(x, y + 1)) px(ctx, X, Y + T - 1, T, 1, C.pathEdge);
    if (!isPath(x - 1, y)) px(ctx, X, Y, 1, T, C.pathEdge);
    if (!isPath(x + 1, y)) px(ctx, X + T - 1, Y, 1, T, C.pathEdge);
  } else if (t === GROUND.PLAZA) {
    px(ctx, X, Y, T, T, C.plaza);
    px(ctx, X, Y + 7, T, 1, C.plazaLine);
    px(ctx, X, Y + 15, T, 1, C.plazaLine);
    px(ctx, X + (y % 2 ? 3 : 11), Y, 1, 7, C.plazaLine);
    px(ctx, X + (y % 2 ? 11 : 3), Y + 8, 1, 7, C.plazaLine);
  } else if (t === GROUND.WATER) {
    px(ctx, X, Y, T, T, C.water);
    const isWater = (nx, ny) => world.ground[world.idx(nx, ny)] === GROUND.WATER;
    if (!isWater(x, y - 1)) px(ctx, X, Y, T, 2, C.waterDark);
    if (!isWater(x, y + 1)) px(ctx, X, Y + T - 1, T, 1, C.waterLight);
    if (!isWater(x - 1, y)) px(ctx, X, Y, 1, T, C.waterDark);
    if (!isWater(x + 1, y)) px(ctx, X + T - 1, Y, 1, T, C.waterDark);
  }
}

function drawTree(ctx, X, Y, v) {
  disc(ctx, X + 8, Y + 14, 6, C.shadow);
  px(ctx, X + 7, Y + 9, 3, 6, '#7a4a26');
  px(ctx, X + 7, Y + 9, 1, 6, '#5c3519');
  const leaf = v > 0.5 ? '#2e8b3a' : '#2f7d45';
  disc(ctx, X + 8, Y + 6, 6, '#1f5f2a');
  disc(ctx, X + 8, Y + 5, 6, leaf);
  disc(ctx, X + 6, Y + 3, 3, v > 0.5 ? '#46a84f' : '#3f9a5c');
  px(ctx, X + 5, Y + 2, 2, 1, '#6cc66f');
}

function drawDeco(ctx, world, x, y) {
  const d = world.deco[world.idx(x, y)];
  if (!d) return;
  const X = x * T;
  const Y = y * T;
  const v = hash(x, y, 3);
  if (d === 'tree') drawTree(ctx, X, Y, v);
  else if (d === 'flower') {
    const colors = ['#f43f5e', '#facc15', '#ffffff', '#f472b6', '#a78bfa'];
    for (let k = 0; k < 3; k++) {
      const fx = X + 2 + Math.floor(hash(x, y, k + 20) * 11);
      const fy = Y + 3 + Math.floor(hash(y, x, k + 20) * 9);
      px(ctx, fx, fy + 1, 1, 2, '#3f8f2f');
      px(ctx, fx - 1, fy, 3, 1, colors[Math.floor(hash(x, y, k) * colors.length)]);
      px(ctx, fx, fy - 1, 1, 3, colors[Math.floor(hash(x, y, k) * colors.length)]);
      px(ctx, fx, fy, 1, 1, '#fde047');
    }
  } else if (d === 'rock') {
    disc(ctx, X + 8, Y + 12, 5, C.shadow);
    disc(ctx, X + 8, Y + 10, 5, '#8b929c');
    disc(ctx, X + 7, Y + 9, 3, '#a9b0b9');
    px(ctx, X + 6, Y + 7, 2, 1, '#cfd4da');
  } else if (d === 'bush') {
    disc(ctx, X + 8, Y + 12, 6, C.shadow);
    disc(ctx, X + 8, Y + 10, 6, '#2f8a3b');
    disc(ctx, X + 6, Y + 8, 3, '#48a852');
    px(ctx, X + 10, Y + 9, 1, 1, '#ef4444');
    px(ctx, X + 5, Y + 11, 1, 1, '#ef4444');
  } else if (d === 'tuft') {
    px(ctx, X + 5, Y + 9, 1, 3, C.grassDark);
    px(ctx, X + 7, Y + 8, 1, 4, C.grassDark);
    px(ctx, X + 9, Y + 10, 1, 2, C.grassDark);
  }
}

function drawBuilding(ctx, b) {
  const X = b.x * T;
  const Y = b.y * T;
  const w = b.w * T;
  const h = b.h * T;
  const roofH = Math.round(h * 0.45);
  const wallY = Y + roofH;
  const wallH = h - roofH;
  const door = doorOf(b);
  const doorX = door.x * T + 3;

  px(ctx, X + 3, Y + h - 2, w, 4, C.shadow);
  // Walls with siding lines.
  px(ctx, X, wallY, w, wallH, b.wall);
  for (let yy = wallY + 4; yy < Y + h; yy += 4) px(ctx, X, yy, w, 1, b.wallDark);
  px(ctx, X, Y + h - 2, w, 2, b.wallDark);

  // Windows, skipping the door.
  for (let wx = X + 6; wx + 10 < X + w - 2; wx += 18) {
    if (wx + 12 > doorX - 2 && wx < doorX + 12) continue;
    const wy = wallY + 6;
    px(ctx, wx - 1, wy - 1, 12, 10, b.neon ? '#f0abfc' : '#4b3a2a');
    px(ctx, wx, wy, 10, 8, b.neon ? '#22d3ee' : '#9cc9f5');
    px(ctx, wx, wy, 10, 3, b.neon ? '#a5f3fc' : '#cde7ff');
    px(ctx, wx + 4, wy, 1, 8, b.neon ? '#f0abfc' : '#4b3a2a');
    if (!b.neon) px(ctx, wx - 1, wy + 9, 12, 2, '#7a5c3e');
  }

  // Roof: overhanging eaves with shingle rows.
  px(ctx, X - 3, Y, w + 6, roofH, b.roof);
  for (let yy = Y + 3; yy < Y + roofH - 3; yy += 4) {
    px(ctx, X - 3, yy, w + 6, 1, b.roofDark);
    for (let xx = X - 3 + ((yy / 4) % 2 ? 0 : 4); xx < X + w + 3; xx += 8) px(ctx, xx, yy - 3, 1, 3, b.roofDark);
  }
  px(ctx, X - 3, Y, w + 6, 2, b.roofDark);
  px(ctx, X - 3, Y + roofH - 3, w + 6, 3, b.roofDark);
  px(ctx, X - 3, Y + roofH, w + 6, 1, 'rgba(0,0,0,0.25)');
  if (b.neon) {
    px(ctx, X - 3, Y + roofH - 3, w + 6, 1, '#f0abfc');
    px(ctx, X - 3, Y + 2, w + 6, 1, '#67e8f9');
  }
  // Chimney on the house.
  if (b.id === 'about') {
    px(ctx, X + w - 20, Y - 6, 7, 10, '#7c2d12');
    px(ctx, X + w - 21, Y - 7, 9, 2, '#57200d');
  }

  // Door with frame and step.
  px(ctx, doorX - 2, Y + h - 17, 14, 17, '#3f2a1a');
  px(ctx, doorX, Y + h - 15, 10, 15, b.neon ? '#111827' : '#8a5a2b');
  px(ctx, doorX, Y + h - 15, 10, 2, b.neon ? '#a855f7' : '#a26c38');
  px(ctx, doorX + 7, Y + h - 8, 1, 2, '#fbbf24');
  if (b.neon) px(ctx, doorX + 2, Y + h - 12, 6, 1, '#22d3ee');
}

export function renderStatic(world) {
  const canvas = document.createElement('canvas');
  canvas.width = W * T;
  canvas.height = H * T;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawGround(ctx, world, x, y);
  for (const b of BUILDINGS) drawBuilding(ctx, b);

  // Signboard (static).
  const sx = SIGN.x * T;
  const sy = SIGN.y * T;
  px(ctx, sx + 7, sy + 6, 2, 10, '#6b4423');
  px(ctx, sx, sy, 16, 9, '#8b5a2b');
  px(ctx, sx + 1, sy + 1, 14, 7, '#a8733d');
  px(ctx, sx + 3, sy + 3, 10, 1, '#5c3a1c');
  px(ctx, sx + 3, sy + 5, 7, 1, '#5c3a1c');

  // Trees and props drawn row by row so canopies overlap naturally.
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawDeco(ctx, world, x, y);
  return canvas;
}

export function drawFountain(ctx, time) {
  const X = FOUNTAIN.x * T;
  const Y = FOUNTAIN.y * T;
  disc(ctx, X + 16, Y + 18, 15, C.shadow);
  disc(ctx, X + 16, Y + 16, 15, '#9ca3af');
  disc(ctx, X + 16, Y + 16, 12, '#6b7280');
  disc(ctx, X + 16, Y + 16, 11, C.water);
  disc(ctx, X + 16, Y + 15, 4, '#9ca3af');
  const f = Math.floor(time * 6) % 4;
  px(ctx, X + 15, Y + 3 + (f % 2), 2, 10, '#bfe3ff');
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + time * 1.5;
    px(ctx, Math.round(X + 16 + Math.cos(a) * 7), Math.round(Y + 16 + Math.sin(a) * 5), 1, 1, C.waterLight);
  }
}

export function drawChest(ctx, x, y, open, time) {
  const X = x * T;
  const Y = y * T;
  px(ctx, X + 1, Y + 13, 14, 3, C.shadow);
  px(ctx, X + 1, Y + 6, 14, 9, '#8b4513');
  px(ctx, X + 1, Y + 6, 14, 1, '#5c2d0c');
  px(ctx, X + 1, Y + 10, 14, 1, '#d4a017');
  px(ctx, X + 7, Y + 9, 2, 3, '#facc15');
  if (open) {
    px(ctx, X + 1, Y + 1, 14, 5, '#5c2d0c');
    px(ctx, X + 2, Y + 5, 12, 2, '#fde68a');
  } else {
    px(ctx, X + 1, Y + 2, 14, 5, '#a0522d');
    px(ctx, X + 1, Y + 2, 14, 1, '#c26a3a');
    // Sparkle to attract attention.
    const s = Math.floor(time * 3) % 3;
    if (s === 0) {
      px(ctx, X + 13, Y - 2, 1, 3, '#fff7ae');
      px(ctx, X + 12, Y - 1, 3, 1, '#fff7ae');
    }
  }
}

const PLAYER = { hair: '#2b1d14', skin: '#c68642', shirt: '#1e3a8a', shirtLight: '#3b5bdb', pants: '#374151', shoes: '#111827' };
const GUIDE = { hair: '#d1d5db', skin: '#d8a06a', shirt: '#047857', shirtLight: '#10b981', pants: '#4b5563', shoes: '#1f2937' };

// Character sprite, 12x16, feet at (x, y).
export function drawCharacter(ctx, x, y, dir, step, moving, palette = PLAYER) {
  const p = palette;
  const X = Math.round(x) - 6;
  const bob = moving && step % 2 ? 1 : 0;
  const Y = Math.round(y) - 16 - bob;
  ctx.fillStyle = C.shadow;
  ctx.fillRect(X + 2, Math.round(y) - 2, 8, 2);
  ctx.fillRect(X + 3, Math.round(y) - 1, 6, 1);

  // Legs and shoes with a two-frame walk.
  const lUp = moving && step % 2 === 0 ? 1 : 0;
  const rUp = moving && step % 2 === 1 ? 1 : 0;
  px(ctx, X + 3, Y + 12 - lUp, 2, 3, p.pants);
  px(ctx, X + 7, Y + 12 - rUp, 2, 3, p.pants);
  px(ctx, X + 3, Y + 15 - lUp, 2, 1, p.shoes);
  px(ctx, X + 7, Y + 15 - rUp, 2, 1, p.shoes);

  // Body and arms.
  px(ctx, X + 2, Y + 8, 8, 5, p.shirt);
  px(ctx, X + 3, Y + 8, 6, 1, p.shirtLight);
  const swing = moving ? (step % 2 ? 1 : -1) : 0;
  if (dir === 'left' || dir === 'right') {
    px(ctx, X + 5 + swing, Y + 9, 2, 3, p.shirt);
    px(ctx, X + 5 + swing, Y + 12, 2, 1, p.skin);
  } else {
    px(ctx, X + 1, Y + 9 + swing, 1, 3, p.shirt);
    px(ctx, X + 10, Y + 9 - swing, 1, 3, p.shirt);
    px(ctx, X + 1, Y + 12 + swing, 1, 1, p.skin);
    px(ctx, X + 10, Y + 12 - swing, 1, 1, p.skin);
  }

  // Head.
  px(ctx, X + 2, Y + 2, 8, 7, p.skin);
  px(ctx, X + 1, Y, 10, 3, p.hair);
  px(ctx, X + 2, Y - 1, 7, 1, p.hair);
  if (dir === 'up') {
    px(ctx, X + 1, Y + 2, 10, 6, p.hair);
  } else if (dir === 'down') {
    px(ctx, X + 1, Y + 2, 1, 3, p.hair);
    px(ctx, X + 10, Y + 2, 1, 3, p.hair);
    px(ctx, X + 3, Y + 3, 3, 1, p.hair);
    px(ctx, X + 4, Y + 5, 1, 2, '#1a1a1a');
    px(ctx, X + 7, Y + 5, 1, 2, '#1a1a1a');
    px(ctx, X + 5, Y + 8, 2, 1, '#8a4b2a');
  } else {
    const back = dir === 'left' ? X + 8 : X + 1;
    px(ctx, back, Y + 2, 3, 5, p.hair);
    px(ctx, dir === 'left' ? X + 3 : X + 8, Y + 5, 1, 2, '#1a1a1a');
    px(ctx, dir === 'left' ? X + 1 : X + 10, Y + 5, 1, 2, p.skin);
  }
}

export const drawGuide = (ctx, x, y, dir) => drawCharacter(ctx, x, y, dir, 0, false, GUIDE);

export function drawBubble(ctx, x, y, time) {
  const off = Math.floor(time * 3) % 2;
  const X = Math.round(x) - 3;
  const Y = Math.round(y) - 27 - off;
  px(ctx, X, Y, 7, 8, '#ffffff');
  px(ctx, X - 1, Y + 1, 9, 6, '#ffffff');
  px(ctx, X + 2, Y + 8, 2, 1, '#ffffff');
  px(ctx, X + 3, Y + 1, 1, 4, '#f59e0b');
  px(ctx, X + 3, Y + 6, 1, 1, '#f59e0b');
}

export function drawDoorGlow(ctx, x, y, time) {
  const a = 0.35 + Math.sin(time * 6) * 0.2;
  ctx.fillStyle = `rgba(255, 236, 140, ${a})`;
  ctx.fillRect(x * T + 1, y * T + 1, T - 2, T - 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${a + 0.2})`;
  ctx.fillRect(x * T + 1, y * T + 1, T - 2, 1);
  ctx.fillRect(x * T + 1, y * T + T - 2, T - 2, 1);
}
