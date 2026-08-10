/**
 * Generates the derived brand assets from public/logo.png.
 *
 *   public/favicon.png    640x640  monogram only, teal on the site's navy
 *   public/og-image.png  1200x630  full lockup, light on navy, for link previews
 *
 * Run with `npm run brand` after replacing public/logo.png.
 *
 * Why hand-rolled: the source is a transparent RGBA PNG and the outputs are flat
 * composites, which zlib alone can decode and re-encode. Pulling in sharp or
 * jimp for this would add a native dependency to a project that otherwise has
 * none. If the logo ever gains gradients or multiple colours, swap this for a
 * real image library rather than extending it.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "logo.png");

// Site palette — keep in sync with src/theme.js
const NAVY = [0x0a, 0x0f, 0x1a];
const TEAL = [0x4f, 0xd1, 0xc5];
const LIGHT = [0xe7, 0xed, 0xf5];

/* ---------- decode ---------- */

function decodePNG(buf) {
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (buf[24] !== 8 || buf[25] !== 6) {
    throw new Error("logo.png must be an 8-bit RGBA PNG (colour type 6)");
  }

  let pos = 8;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (type === "IDAT") idat.push(buf.subarray(pos + 8, pos + 8 + len));
    if (type === "IEND") break;
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));

  const bpp = 4;
  const stride = w * bpp;
  const px = Buffer.alloc(h * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const f = raw[src + x];
      const a = x >= bpp ? px[dst + x - bpp] : 0;
      const b = y > 0 ? px[dst - stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[dst - stride + x - bpp] : 0;
      let v;
      if (ft === 0) v = f;
      else if (ft === 1) v = f + a;
      else if (ft === 2) v = f + b;
      else if (ft === 3) v = f + ((a + b) >> 1);
      else v = f + paeth(a, b, c);
      px[dst + x] = v & 0xff;
    }
  }
  return { w, h, px };
}

/* ---------- encode (opaque RGB) ---------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** @param channels 3 for opaque RGB, 4 for RGBA with real transparency */
function encodePNG(w, h, pixels, channels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;                        // bit depth
  ihdr[9] = channels === 4 ? 6 : 2;   // colour type: 6 = RGBA, 2 = RGB
  const stride = w * channels;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- measure ---------- */

/** Horizontal bands of visible ink, top to bottom: [monogram, "ABHISHEK", "PANDA"]. */
function inkBands({ w, h, px }) {
  const alphaAt = (x, y) => px[y * w * 4 + x * 4 + 3];
  const bands = [];
  let start = -1;
  for (let y = 0; y <= h; y++) {
    let on = false;
    if (y < h) for (let x = 0; x < w; x++) if (alphaAt(x, y) > 100) { on = true; break; }
    if (on && start < 0) start = y;
    if (!on && start >= 0) {
      if (y - start > 8) bands.push({ y0: start, y1: y - 1 });
      start = -1;
    }
  }
  // horizontal extent of each band
  for (const b of bands) {
    b.x0 = w; b.x1 = 0;
    for (let y = b.y0; y <= b.y1; y++)
      for (let x = 0; x < w; x++)
        if (alphaAt(x, y) > 100) { if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; }
  }
  return bands;
}

/* ---------- compose ---------- */

/** Bilinear alpha sample at fractional source coordinates. */
function sampleAlpha({ w, h, px }, fx, fy) {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0;
  const a = (x, y) =>
    x < 0 || y < 0 || x >= w || y >= h ? 0 : px[y * w * 4 + x * 4 + 3];
  const top = a(x0, y0) * (1 - tx) + a(x0 + 1, y0) * tx;
  const bot = a(x0, y0 + 1) * (1 - tx) + a(x0 + 1, y0 + 1) * tx;
  return top * (1 - ty) + bot * ty;
}

/**
 * Draw the source region `box` onto an `outW x outH` canvas, tinted `ink`,
 * scaled to occupy at most `fill` of each axis and centred.
 *
 * `transparent: true` emits RGBA with an empty background, carrying the source
 * antialiasing straight into the alpha channel. Otherwise the mark is composited
 * onto an opaque navy plate.
 */
function compose(img, box, outW, outH, ink, fill, transparent = false) {
  const srcW = box.x1 - box.x0 + 1;
  const srcH = box.y1 - box.y0 + 1;
  const scale = Math.min((outW * fill) / srcW, (outH * fill) / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const offX = (outW - drawW) / 2;
  const offY = (outH - drawH) / 2;

  const ch = transparent ? 4 : 3;
  const out = Buffer.alloc(outW * outH * ch);
  if (!transparent) {
    for (let i = 0; i < outW * outH; i++) {
      out[i * 3] = NAVY[0];
      out[i * 3 + 1] = NAVY[1];
      out[i * 3 + 2] = NAVY[2];
    }
  }

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      if (x < offX || x >= offX + drawW || y < offY || y >= offY + drawH) continue;
      const a = sampleAlpha(img, box.x0 + (x - offX) / scale, box.y0 + (y - offY) / scale) / 255;
      if (a <= 0) continue;
      const i = (y * outW + x) * ch;
      if (transparent) {
        // straight (non-premultiplied) alpha: flat ink colour, varying opacity
        out[i] = ink[0];
        out[i + 1] = ink[1];
        out[i + 2] = ink[2];
        out[i + 3] = Math.round(a * 255);
      } else {
        for (let c = 0; c < 3; c++) {
          out[i + c] = Math.round(NAVY[c] * (1 - a) + ink[c] * a);
        }
      }
    }
  }
  return encodePNG(outW, outH, out, ch);
}

/* ---------- run ---------- */

if (!fs.existsSync(SRC)) {
  console.error(`missing ${path.relative(ROOT, SRC)} — add your logo there first`);
  process.exit(1);
}

const img = decodePNG(fs.readFileSync(SRC));
const bands = inkBands(img);
if (bands.length === 0) {
  console.error("no visible pixels found in logo.png");
  process.exit(1);
}

const mark = bands[0];                       // the monogram
const full = {                               // monogram + every text line
  x0: Math.min(...bands.map((b) => b.x0)),
  x1: Math.max(...bands.map((b) => b.x1)),
  y0: bands[0].y0,
  y1: bands[bands.length - 1].y1,
};

console.log(`source ${img.w}x${img.h}, ${bands.length} ink band(s)`);
console.log(`  monogram: x ${mark.x0}-${mark.x1}, y ${mark.y0}-${mark.y1}`);

// Favicon: monogram alone, teal, TRANSPARENT background so it sits directly on
// the browser's own tab colour. Teal is the one palette colour that stays
// legible against both light and dark chrome — navy would vanish on dark, the
// near-white LIGHT would vanish on light.
// Filling 86% is safe without a plate; there's no edge for the mark to collide
// with, so it can run larger than a badged icon would.
fs.writeFileSync(
  path.join(ROOT, "public", "favicon.png"),
  compose(img, mark, 640, 640, TEAL, 0.86, true)
);
console.log("  -> public/favicon.png    640x640  (transparent)");

// Social card: full lockup, light on navy, at the 1.91:1 ratio scrapers expect.
// This one keeps its background on purpose — platforms flatten transparent
// preview images onto white or black, which would wreck a light-ink lockup.
fs.writeFileSync(
  path.join(ROOT, "public", "og-image.png"),
  compose(img, full, 1200, 630, LIGHT, 0.62)
);
console.log("  -> public/og-image.png  1200x630  (navy background)");

// The header crop, so src/App.jsx never has to guess where the monogram sits.
console.log(
  `\nMARK_CROP for src/App.jsx:\n` +
  `  { x: ${(mark.x0 / img.w).toFixed(4)}, y: ${(mark.y0 / img.h).toFixed(4)}, ` +
  `w: ${((mark.x1 - mark.x0 + 1) / img.w).toFixed(4)}, ` +
  `h: ${((mark.y1 - mark.y0 + 1) / img.h).toFixed(4)} }`
);
