// A small QR code generator: byte mode, error correction level M, versions 1 to 20. No network, no library.
// Family names travel only inside this code, so it is drawn here and never by another service.

// Per version: [error-correction bytes per block, blocks in group 1, data bytes per block in group 1, blocks in group 2]
// (blocks in group 2 hold one more data byte).
const BLOCKS = [null,
  [10, 1, 16, 0], [16, 1, 28, 0], [26, 1, 44, 0], [18, 2, 32, 0], [24, 2, 43, 0], [16, 4, 27, 0], [18, 4, 31, 0], [22, 2, 38, 2], [22, 3, 36, 2], [26, 4, 43, 1],
  [30, 1, 50, 4], [22, 6, 36, 2], [22, 8, 37, 1], [24, 4, 40, 5], [24, 5, 41, 5], [28, 7, 45, 3], [28, 10, 46, 1], [26, 9, 43, 4], [26, 3, 44, 11], [26, 3, 41, 13]];
const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
  [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90]];

// ---------- Reed-Solomon over GF(256) ----------
const EXP = new Array(512), LOG = new Array(256);
for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
function remainder(data, n) {
  let gen = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(gen.length + 1).fill(0);
    gen.forEach((g, j) => { next[j] ^= g; next[j + 1] ^= mul(g, EXP[i]); });
    gen = next;
  }
  const out = data.concat(new Array(n).fill(0));
  for (let i = 0; i < data.length; i++) if (out[i]) { const f = out[i]; gen.forEach((g, j) => { out[i + j] ^= mul(g, f); }); }
  return out.slice(data.length);
}

function codewords(bytes, version) {
  const [ec, n1, k1, n2] = BLOCKS[version];
  const capacity = n1 * k1 + n2 * (k1 + 1);
  const bits = [];
  const put = (value, n) => { for (let i = n - 1; i >= 0; i--) bits.push((value >> i) & 1); };
  put(4, 4); put(bytes.length, version < 10 ? 8 : 16);
  bytes.forEach((b) => put(b, 8));
  put(0, Math.min(4, capacity * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let pad = 0xec; data.length < capacity; pad ^= 0xfd) data.push(pad);
  const blocks = [];
  for (let i = 0, at = 0; i < n1 + n2; i++) { const k = i < n1 ? k1 : k1 + 1; blocks.push(data.slice(at, at + k)); at += k; }
  const checks = blocks.map((b) => remainder(b, ec));
  const out = [];
  for (let i = 0; i <= k1; i++) blocks.forEach((b) => { if (i < b.length) out.push(b[i]); });
  for (let i = 0; i < ec; i++) checks.forEach((c) => out.push(c[i]));
  return out;
}

const MASKS = [(r, c) => (r + c) % 2, (r) => r % 2, (r, c) => c % 3, (r, c) => (r + c) % 3, (r, c) => ((r >> 1) + Math.floor(c / 3)) % 2,
  (r, c) => ((r * c) % 2) + ((r * c) % 3), (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2];

function bch(value, poly, shift) {
  let v = value << shift;
  const top = 31 - Math.clz32(poly);
  while (v && 31 - Math.clz32(v) >= top) v ^= poly << (31 - Math.clz32(v) - top);
  return (value << shift) | v;
}

// Returns a square grid of 0 and 1.
export function qrGrid(text) {
  const bytes = [...new TextEncoder().encode(text)];
  let version = 1;
  for (; version <= 20; version++) {
    const [, n1, k1, n2] = BLOCKS[version];
    if (4 + (version < 10 ? 8 : 16) + bytes.length * 8 <= (n1 * k1 + n2 * (k1 + 1)) * 8) break;
  }
  if (version > 20) throw new Error("Too many family members for one code.");
  const size = version * 4 + 17;
  const grid = Array.from({ length: size }, () => new Array(size).fill(null));
  const set = (r, c, v) => { if (r >= 0 && c >= 0 && r < size && c < size) grid[r][c] = v ? 1 : 0; };
  const square = (r0, c0, half, on) => { for (let r = -half; r <= half; r++) for (let c = -half; c <= half; c++) set(r0 + r, c0 + c, on(Math.max(Math.abs(r), Math.abs(c)))); };
  for (const [r, c] of [[3, 3], [3, size - 4], [size - 4, 3]]) square(r, c, 4, (d) => d !== 2 && d !== 4);
  const al = ALIGN[version];
  for (const r of al) for (const c of al) if (grid[r][c] === null) square(r, c, 2, (d) => d !== 1);
  for (let i = 8; i < size - 8; i++) { if (grid[6][i] === null) set(6, i, i % 2 === 0); if (grid[i][6] === null) set(i, 6, i % 2 === 0); }
  const format = (mask) => {
    const f = bch(mask, 0x537, 10) ^ 0x5412; // level M is 00
    for (let i = 0; i < 15; i++) {
      const v = (f >> i) & 1;
      if (i < 6) set(i, 8, v); else if (i < 8) set(i + 1, 8, v); else set(size - 15 + i, 8, v);
      if (i < 8) set(8, size - 1 - i, v); else if (i === 8) set(8, 7, v); else set(8, 14 - i, v);
    }
    set(size - 8, 8, 1);
  };
  format(0);
  if (version >= 7) {
    const v = bch(version, 0x1f25, 12);
    for (let i = 0; i < 18; i++) { const b = (v >> i) & 1, a = Math.floor(i / 3), k = (i % 3) + size - 11; set(a, k, b); set(k, a, b); }
  }
  const fixed = grid.map((row) => row.map((v) => v !== null));
  const bits = codewords(bytes, version).flatMap((b) => Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1));
  let at = 0, up = true;
  for (let right = size - 1; right > 0; right -= 2, up = !up) {
    if (right === 6) right--;
    for (let i = 0; i < size; i++) {
      const r = up ? size - 1 - i : i;
      for (const c of [right, right - 1]) if (!fixed[r][c]) grid[r][c] = bits[at++] || 0;
    }
  }
  let best = null;
  for (let m = 0; m < 8; m++) {
    const apply = () => { for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fixed[r][c] && MASKS[m](r, c) === 0) grid[r][c] ^= 1; };
    apply(); format(m);
    const score = penalty(grid);
    if (!best || score < best.score) best = { m, score };
    apply();
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fixed[r][c] && MASKS[best.m](r, c) === 0) grid[r][c] ^= 1;
  format(best.m);
  return grid;
}

function penalty(g) {
  const n = g.length;
  let p = 0, dark = 0;
  for (let a = 0; a < n; a++) {
    for (const line of [g[a], g.map((row) => row[a])]) {
      for (let i = 0, run = 1; i < n; i++, run++) if (i === n - 1 || line[i] !== line[i + 1]) { if (run >= 5) p += run - 2; run = 0; }
      const s = line.join("");
      for (const pat of ["10111010000", "00001011101"]) for (let i = s.indexOf(pat); i >= 0; i = s.indexOf(pat, i + 1)) p += 40;
    }
    for (let b = 0; b < n; b++) {
      dark += g[a][b];
      if (a + 1 < n && b + 1 < n && g[a][b] === g[a][b + 1] && g[a][b] === g[a + 1][b] && g[a][b] === g[a + 1][b + 1]) p += 3;
    }
  }
  return p + Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10;
}

export function qrSvg(text, label) {
  const g = qrGrid(text), n = g.length + 8;
  const d = g.flatMap((row, r) => row.map((v, c) => (v ? `M${c + 4},${r + 4}h1v1h-1z` : ""))).join("");
  return `<svg viewBox="0 0 ${n} ${n}" role="img" aria-label="${label}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="#1d1b16"/></svg>`;
}
