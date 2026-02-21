// ============================================================
// Vagabondo App - Figma Screen Generator Plugin
// Generates all 4 app screens: Map, Events List, Create Event,
// Event Detail — using the exact design tokens from src/theme
// ============================================================

// ── Design Tokens ──────────────────────────────────────────
const C = {
  primary:      '#FF5F2E',
  primaryDark:  '#E04420',
  primaryLight: '#FF8A65',
  primaryBg:    '#FFF3EF',
  secondary:    '#1A1A2E',
  accent:       '#FFD166',
  bg:           '#F8F7F4',
  card:         '#FFFFFF',
  surface:      '#F3F2EF',
  text:         '#1A1A2E',
  textSec:      '#6B7280',
  textLight:    '#9CA3AF',
  textInv:      '#FFFFFF',
  border:       '#E5E7EB',
  borderLight:  '#F3F4F6',
  success:      '#10B981',
  successBg:    '#ECFDF5',
  error:        '#EF4444',
};

const CATS = [
  { id: 'museum',   label: 'Museum',   emoji: '🏛️', color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'cafe',     label: 'Café',     emoji: '☕', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'park',     label: 'Park',     emoji: '🌳', color: '#10B981', bg: '#ECFDF5' },
  { id: 'concert',  label: 'Concert',  emoji: '🎵', color: '#EF4444', bg: '#FEF2F2' },
  { id: 'theater',  label: 'Theater',  emoji: '🎭', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'food',     label: 'Food',     emoji: '🍕', color: '#F97316', bg: '#FFF7ED' },
  { id: 'art',      label: 'Art',      emoji: '🎨', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'festival', label: 'Festival', emoji: '🎪', color: '#14B8A6', bg: '#F0FDFA' },
  { id: 'sports',   label: 'Sports',   emoji: '🏋️', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'cinema',   label: 'Cinema',   emoji: '🎬', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'other',    label: 'Other',    emoji: '📍', color: '#6B7280', bg: '#F9FAFB' },
];

const SW   = 390;   // screen width  (iPhone 14)
const SH   = 844;   // screen height
const SB   = 44;    // status bar
const TB   = 82;    // tab bar
const GAP  = 64;    // gap between screens

// ── Utility helpers ─────────────────────────────────────────
function hex2rgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1],16)/255, g: parseInt(r[2],16)/255, b: parseInt(r[3],16)/255 }
           : { r:0, g:0, b:0 };
}

function solidFill(hex, a = 1) {
  const { r, g, b } = hex2rgb(hex);
  return [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
}

function pos(node, x, y) { node.x = x; node.y = y; return node; }

function frame(w, h, fillHex) {
  const f = figma.createFrame();
  f.resize(w, h);
  f.fills  = fillHex ? solidFill(fillHex) : [];
  f.clipsContent = true;
  return f;
}

function rect(w, h, fillHex, opts = {}) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = fillHex ? solidFill(fillHex, opts.fillOpacity || 1) : [];
  if (opts.radius)       r.cornerRadius = opts.radius;
  if (opts.strokeColor)  { r.strokes = solidFill(opts.strokeColor); r.strokeWeight = opts.sw || 1; }
  if (opts.opacity != null) r.opacity = opts.opacity;
  return r;
}

function ellipse(w, h, fillHex) {
  const e = figma.createEllipse();
  e.resize(w, h);
  e.fills = fillHex ? solidFill(fillHex) : [];
  return e;
}

// Font cache
const _loaded = new Set();
async function loadFont(family, style) {
  const key = `${family}|${style}`;
  if (!_loaded.has(key)) {
    await figma.loadFontAsync({ family, style });
    _loaded.add(key);
  }
}

// Weight → Inter style
function weightToStyle(w) {
  if (w === '700' || w === 'bold')   return 'Bold';
  if (w === '600')                    return 'Semi Bold';
  return 'Regular';
}

async function txt(content, opts = {}) {
  const style  = weightToStyle(opts.weight || '400');
  const family = 'Inter';
  try { await loadFont(family, style); } catch { await loadFont('Roboto', style === 'Semi Bold' ? 'Medium' : style); }

  const t = figma.createText();
  try {
    t.fontName = { family, style };
  } catch {
    t.fontName = { family: 'Roboto', style: style === 'Semi Bold' ? 'Medium' : style };
  }
  t.fontSize  = opts.size  || 14;
  t.fills     = solidFill(opts.color || C.text);
  if (opts.w && opts.h) { t.textAutoResize = 'NONE'; t.resize(opts.w, opts.h); }
  else if (opts.w) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, 1); }
  t.characters = content;
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}

// Shorthand: append child and position it
function add(parent, child, x, y) {
  parent.appendChild(child);
  pos(child, x, y);
  return child;
}

// Pill / badge frame
function pill(w, h, fillHex, strokeHex, sw = 1) {
  const f = frame(w, h, fillHex);
  f.cornerRadius = h / 2;
  if (strokeHex) { f.strokes = solidFill(strokeHex); f.strokeWeight = sw; }
  return f;
}

// ── Shared sub-components ────────────────────────────────────
async function addStatusBar(parent, y = 0) {
  const bar = frame(SW, SB, null);
  bar.name = 'Status Bar';
  add(bar, await txt('9:41', { size: 15, weight: '600' }), 20, 14);
  add(bar, await txt('●●●', { size: 10, color: C.text }),   310, 17);
  add(parent, bar, 0, y);
}

async function addTabBar(parent) {
  const bar = frame(SW, TB, C.card);
  bar.name = 'Tab Bar';

  // top border
  add(bar, rect(SW, 1, C.border), 0, 0);

  // Map tab
  add(bar, await txt('🗺️', { size: 24 }), 56, 8);
  add(bar, await txt('Map', { size: 11, weight: '600', color: C.primary }), 58, 36);

  // Center create button
  const createCircle = ellipse(56, 56, C.primary);
  add(bar, createCircle, 167, -14);
  add(bar, await txt('+', { size: 30, weight: '700', color: C.textInv }), 182, 0);

  // Events tab
  add(bar, await txt('📋', { size: 24 }), 288, 8);
  add(bar, await txt('Events', { size: 11, weight: '600', color: C.textSec }), 280, 36);

  add(parent, bar, 0, SH - TB);
}

async function catBadge(cat, w = 88) {
  const b = pill(w, 26, cat.bg, null);
  add(b, await txt(`${cat.emoji} ${cat.label}`, { size: 11, weight: '600', color: cat.color }), 10, 6);
  return b;
}

// ── SCREEN 1 – Map ──────────────────────────────────────────
async function buildMapScreen(ox) {
  const s = frame(SW, SH, C.bg);
  s.name  = '1 · Map';
  pos(s, ox, 0);

  // Map placeholder (grey canvas)
  const mapBg = rect(SW, SH - TB + 10, '#D1D5DB');
  mapBg.name  = 'Map Background';
  add(s, mapBg, 0, 0);

  // Grid lines
  for (let i = 0; i < 9; i++) add(s, rect(SW, 1, '#B8BEC7', { opacity: 0.4 }), 0, 80 + i * 80);
  for (let i = 0; i < 6; i++) add(s, rect(1, SH - TB, '#B8BEC7', { opacity: 0.4 }), 55 + i * 70, 0);

  // Streets
  add(s, rect(SW, 5, '#E5E7EB'), 0, 290);
  add(s, rect(SW, 4, '#E5E7EB'), 0, 430);
  add(s, rect(5, SH, '#E5E7EB'), 155, 0);
  add(s, rect(4, SH, '#E5E7EB'), 265, 0);

  // Event markers
  const markers = [
    { x: 130, y: 190, cat: CATS[0] },  // Museum
    { x: 218, y: 310, cat: CATS[3] },  // Concert
    { x: 305, y: 170, cat: CATS[2] },  // Park
    { x: 72,  y: 400, cat: CATS[1] },  // Café
    { x: 262, y: 450, cat: CATS[6] },  // Art
    { x: 175, y: 500, cat: CATS[5], selected: true },  // Food (selected)
  ];
  for (const m of markers) {
    const pin = ellipse(32, 32, m.cat.color);
    pin.opacity = m.selected ? 1 : 0.85;
    add(s, pin, m.x, m.y);
    add(s, await txt(m.cat.emoji, { size: 13 }), m.x + 7, m.y + 7);
    if (m.selected) {
      // selection ring
      const ring = ellipse(44, 44, null);
      ring.strokes = solidFill(m.cat.color);
      ring.strokeWeight = 2;
      ring.fills = solidFill(m.cat.color, 0.15);
      add(s, ring, m.x - 6, m.y - 6);
    }
  }

  // User location dot
  add(s, ellipse(18, 18, '#3B82F6'), 188, 378);
  add(s, ellipse(8, 8, C.card), 193, 383);

  // Status bar
  await addStatusBar(s, 0);

  // Floating header card
  const hCard = frame(SW - 32, 52, C.card);
  hCard.cornerRadius = 16;
  hCard.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.08}, offset:{x:0,y:2}, radius:8, spread:0, visible:true, blendMode:'NORMAL' }];
  add(hCard, await txt('Vagabondo', { size: 18, weight: '700' }), 16, 14);
  const countBadge = pill(80, 26, C.primaryBg, null);
  add(countBadge, await txt('6 events', { size: 11, weight: '600', color: C.primary }), 11, 6);
  add(hCard, countBadge, SW - 32 - 94, 13);
  add(s, hCard, 16, SB + 8);

  // Recenter button
  const locBtn = frame(44, 44, C.card);
  locBtn.cornerRadius = 22;
  locBtn.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.1}, offset:{x:0,y:2}, radius:6, spread:0, visible:true, blendMode:'NORMAL' }];
  add(locBtn, await txt('📍', { size: 20 }), 10, 9);
  add(s, locBtn, SW - 60, SH - TB - 116);

  // Event preview card (bottom sheet)
  const pCard = frame(SW - 32, 148, C.card);
  pCard.cornerRadius = 20;
  pCard.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.12}, offset:{x:0,y:-2}, radius:16, spread:0, visible:true, blendMode:'NORMAL' }];

  const pBadge = await catBadge(CATS[5]);
  add(pCard, pBadge, 16, 14);
  add(pCard, await txt('✕', { size: 14, color: C.textSec }), SW - 32 - 28, 16);
  add(pCard, await txt('Pizza & Wine Evening', { size: 16, weight: '700' }), 16, 46);
  add(pCard, await txt('by Marco · 1h ago', { size: 12, color: C.textSec }), 16, 70);
  add(pCard, await txt('✅ 12 going', { size: 12, color: C.success }), 16, 98);
  add(pCard, await txt('💬 5 replies', { size: 12, color: C.textSec }), 110, 98);

  const viewBtn = pill(80, 32, C.primary, null);
  add(viewBtn, await txt('View →', { size: 13, weight: '600', color: C.textInv }), 14, 8);
  add(pCard, viewBtn, SW - 32 - 96, 94);

  add(s, pCard, 16, SH - TB - 164);

  await addTabBar(s);
  figma.currentPage.appendChild(s);
  return s;
}

// ── SCREEN 2 – Events List ───────────────────────────────────
async function buildListScreen(ox) {
  const s = frame(SW, SH, C.bg);
  s.name  = '2 · Events List';
  pos(s, ox, 0);

  await addStatusBar(s, 0);

  // Page title
  add(s, await txt('Events Near You', { size: 20, weight: '700' }), 20, SB + 14);

  // Search bar
  const search = frame(SW - 32, 44, C.card);
  search.cornerRadius = 12;
  search.strokes = solidFill(C.border);
  search.strokeWeight = 1;
  add(search, await txt('🔍', { size: 16 }), 12, 13);
  add(search, await txt('Search events…', { size: 14, color: C.textLight }), 38, 14);
  add(s, search, 16, SB + 50);

  // Sort buttons
  const newest = pill(90, 34, C.primary, null);
  add(newest, await txt('Newest', { size: 13, weight: '600', color: C.textInv }), 19, 9);
  add(s, newest, 16, SB + 106);

  const popular = pill(108, 34, C.surface, C.border);
  add(popular, await txt('🔥 Popular', { size: 13, weight: '600', color: C.textSec }), 16, 9);
  add(s, popular, 118, SB + 106);

  // Category filter chips
  const chipY = SB + 152;
  const allChip = pill(52, 30, C.primary, null);
  add(allChip, await txt('✨ All', { size: 11, weight: '600', color: C.textInv }), 7, 7);
  add(s, allChip, 16, chipY);
  let cx = 78;
  for (const cat of CATS.slice(0, 5)) {
    const cw = cat.label.length * 7 + 38;
    const chip = pill(cw, 30, C.card, C.border);
    add(chip, await txt(`${cat.emoji} ${cat.label}`, { size: 11, weight: '600', color: C.textSec }), 8, 8);
    add(s, chip, cx, chipY);
    cx += cw + 8;
  }

  // Event cards
  const events = [
    { title: 'Jazz Night at Trastevere',  cat: CATS[3], loc: 'Trastevere, Rome',   time: '2h ago',  author: 'Sofia', going: 24, rep: 8  },
    { title: 'Free Yoga in Villa Borghese', cat: CATS[8], loc: 'Villa Borghese',   time: '45m ago', author: 'Luca',  going: 15, rep: 3  },
    { title: 'Street Art Walking Tour',    cat: CATS[6], loc: 'Pigneto, Rome',     time: '3h ago',  author: 'Anna',  going: 9,  rep: 12 },
  ];

  let cy = SB + 196;
  for (const ev of events) {
    const card = frame(SW - 32, 120, C.card);
    card.cornerRadius = 14;
    card.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.06}, offset:{x:0,y:1}, radius:4, spread:0, visible:true, blendMode:'NORMAL' }];

    // Left colour stripe
    const stripe = rect(4, 120, ev.cat.color, { radius: 2 });
    add(card, stripe, 0, 0);

    const badge = await catBadge(ev.cat, 84);
    add(card, badge, 16, 12);
    add(card, await txt(ev.time, { size: 11, color: C.textLight }), SW - 32 - 64, 16);
    add(card, await txt(ev.title, { size: 15, weight: '700', w: SW - 32 - 24 }), 16, 42);
    add(card, await txt(`📍 ${ev.loc}`, { size: 12, color: C.textSec }), 16, 66);
    add(card, await txt(ev.author, { size: 12, color: C.textSec }), 16, 88);
    add(card, await txt(`💬 ${ev.rep}`, { size: 12, color: C.textSec }), 74, 88);

    const goBtn = pill(96, 30, C.primaryBg, C.primary);
    add(goBtn, await txt(`🙋 ${ev.going}`, { size: 12, weight: '600', color: C.primary }), 16, 7);
    add(card, goBtn, SW - 32 - 110, 84);

    add(s, card, 16, cy);
    cy += 130;
  }

  // Empty-state hint (partially visible)
  await addTabBar(s);
  figma.currentPage.appendChild(s);
  return s;
}

// ── SCREEN 3 – Create Event (Step 1: Category) ───────────────
async function buildCreateScreen(ox) {
  const s = frame(SW, SH, C.bg);
  s.name  = '3 · Create Event';
  pos(s, ox, 0);

  await addStatusBar(s, 0);

  // Header
  add(s, await txt('← Back', { size: 14, color: C.primary }), 20, SB + 14);
  add(s, await txt('New Event', { size: 20, weight: '700' }), SW / 2 - 48, SB + 12);

  // Progress dots
  const dotColors = [C.primary, C.border, C.border];
  const labels    = ['Category', 'Details', 'Location'];
  const dotStartX = 55;
  for (let i = 0; i < 3; i++) {
    const dotX = dotStartX + i * 120;
    const dot  = ellipse(26, 26, dotColors[i]);
    add(s, dot, dotX, SB + 52);
    add(s, await txt(`${i + 1}`, { size: 12, weight: '700', color: i === 0 ? C.textInv : C.textLight }), dotX + 9, SB + 58);
    add(s, await txt(labels[i], { size: 11, color: i === 0 ? C.primary : C.textLight }), dotX - (labels[i].length * 2), SB + 82);
    if (i < 2) add(s, rect(88, 2, C.border), dotX + 26, SB + 64);
  }

  // Category grid (3 cols × 4 rows)
  const gridY  = SB + 112;
  const cols   = 3;
  const tileW  = Math.floor((SW - 48) / cols);   // ~114
  const tileH  = 84;

  for (let i = 0; i < CATS.length; i++) {
    const cat  = CATS[i];
    const col  = i % cols;
    const row  = Math.floor(i / cols);
    const tx   = 16 + col * (tileW + 8);
    const ty   = gridY + row * (tileH + 8);
    const sel  = i === 0;

    const tile = frame(tileW, tileH, sel ? cat.bg : C.card);
    tile.cornerRadius = 16;
    tile.strokes = solidFill(sel ? cat.color : C.border);
    tile.strokeWeight = sel ? 2 : 1;

    add(tile, await txt(cat.emoji, { size: 26 }), tileW / 2 - 13, 12);
    add(tile, await txt(cat.label, { size: 12, weight: '600', color: sel ? cat.color : C.textSec }), tileW / 2 - cat.label.length * 3.4, 48);

    add(s, tile, tx, ty);
  }

  // Continue button
  const contBtn = frame(SW - 32, 52, C.primary);
  contBtn.cornerRadius = 16;
  add(contBtn, await txt('Continue →', { size: 15, weight: '700', color: C.textInv }), SW / 2 - 16 - 38, 14);
  add(s, contBtn, 16, SH - TB - 68);

  await addTabBar(s);
  figma.currentPage.appendChild(s);
  return s;
}

// ── SCREEN 4 – Event Detail ──────────────────────────────────
async function buildDetailScreen(ox) {
  const s = frame(SW, SH, C.bg);
  s.name  = '4 · Event Detail';
  pos(s, ox, 0);

  await addStatusBar(s, 0);

  // Header
  add(s, await txt('← Back', { size: 14, color: C.primary }), 20, SB + 14);

  // Scrollable content area
  const scroll = frame(SW, SH - SB - 52 - TB, null);
  scroll.name  = 'Scrollable Content';
  add(s, scroll, 0, SB + 52);

  let cy = 8;
  const cat = CATS[0]; // Museum

  // Category badge
  const badge = await catBadge(cat, 104);
  add(scroll, badge, 20, cy); cy += 38;

  // Title
  add(scroll, await txt('Ancient Ruins After Dark', { size: 24, weight: '700', w: SW - 40 }), 20, cy); cy += 40;

  // Byline
  add(scroll, await txt('by Elena · 30m ago', { size: 13, color: C.textSec }), 20, cy); cy += 28;

  // Description
  const desc = await txt(
    'Spontaneous night visit to the ancient ruins with fellow history lovers. Bring a light jacket — it gets breezy after sundown!',
    { size: 14, color: C.textSec, w: SW - 40 }
  );
  add(scroll, desc, 20, cy); cy += 56;

  // Map embed
  const mapCard = frame(SW - 40, 160, '#D1D5DB');
  mapCard.cornerRadius = 16;
  add(mapCard, rect(SW - 40, 4, '#E5E7EB'), 0, 80);
  add(mapCard, rect(4, 160, '#E5E7EB'), 170, 0);
  // Pin
  add(mapCard, ellipse(28, 28, C.primary), (SW - 40) / 2 - 14, 56);
  add(mapCard, await txt('🏛️', { size: 13 }), (SW - 40) / 2 - 7, 63);
  // Location overlay
  const locOverlay = frame(SW - 40, 34, null);
  const locBg = rect(SW - 40, 34, '#000000', { fillOpacity: 0.38 });
  add(locOverlay, locBg, 0, 0);
  add(locOverlay, await txt('📍 Roman Forum, Rome', { size: 12, color: C.textInv }), 12, 10);
  add(mapCard, locOverlay, 0, 126);
  add(scroll, mapCard, 20, cy); cy += 174;

  // Going button
  const goBtn = frame(SW - 40, 52, C.primary);
  goBtn.cornerRadius = 16;
  add(goBtn, await txt("🙋  I'm going!    ·   18 going", { size: 15, weight: '700', color: C.textInv }), 48, 14);
  add(scroll, goBtn, 20, cy); cy += 68;

  // Social connect
  add(scroll, await txt('Connect with Elena', { size: 15, weight: '700' }), 20, cy); cy += 34;
  const socials = [
    { label: '✈️  Telegram',  color: '#2AABEE' },
    { label: '📸  Instagram', color: '#E1306C' },
  ];
  let sx = 20;
  for (const soc of socials) {
    const btn = pill(130, 36, C.card, soc.color, 1.5);
    add(btn, await txt(soc.label, { size: 13, weight: '600', color: soc.color }), 14, 10);
    add(scroll, btn, sx, cy);
    sx += 142;
  }
  cy += 52;

  // Divider
  add(scroll, rect(SW, 1, C.border), 0, cy); cy += 20;

  // Replies header
  add(scroll, await txt('3 Replies', { size: 15, weight: '700' }), 20, cy); cy += 36;

  const replies = [
    { name: 'Marco', time: '20m ago', text: 'Count me in! I know this place well 🏛️' },
    { name: 'Sara',  time: '15m ago', text: 'Amazing idea! See you there 🎉' },
  ];
  for (const r of replies) {
    const rCard = frame(SW - 40, 80, C.card);
    rCard.cornerRadius = 12;
    // Avatar
    const av = ellipse(36, 36, C.primaryBg);
    add(rCard, av, 12, 22);
    add(rCard, await txt(r.name[0], { size: 15, weight: '700', color: C.primary }), 24, 31);

    add(rCard, await txt(r.name, { size: 13, weight: '600' }), 58, 14);
    add(rCard, await txt(r.time, { size: 11, color: C.textLight }), 58, 32);
    add(rCard, await txt(r.text, { size: 13, color: C.textSec, w: SW - 40 - 68 }), 58, 50);

    add(scroll, rCard, 20, cy); cy += 90;
  }

  // Write reply prompt
  const replyPrompt = frame(SW - 40, 44, C.card);
  replyPrompt.cornerRadius = 12;
  replyPrompt.strokes = solidFill(C.border);
  replyPrompt.strokeWeight = 1;
  add(replyPrompt, await txt('💬  Write a reply…', { size: 14, color: C.textLight }), 16, 14);
  add(scroll, replyPrompt, 20, cy);

  await addTabBar(s);
  figma.currentPage.appendChild(s);
  return s;
}

// ── Entry point ──────────────────────────────────────────────
async function run() {
  // Pre-load fonts
  try {
    await Promise.all([
      figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
      figma.loadFontAsync({ family: 'Inter', style: 'Bold' }),
      figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }),
    ]);
    _loaded.add('Inter|Regular');
    _loaded.add('Inter|Bold');
    _loaded.add('Inter|Semi Bold');
  } catch {
    // Fallback: use Roboto (always available in Figma)
    await Promise.all([
      figma.loadFontAsync({ family: 'Roboto', style: 'Regular' }),
      figma.loadFontAsync({ family: 'Roboto', style: 'Bold' }),
      figma.loadFontAsync({ family: 'Roboto', style: 'Medium' }),
    ]);
    _loaded.add('Roboto|Regular');
    _loaded.add('Roboto|Bold');
    _loaded.add('Roboto|Medium');
  }

  const s1 = await buildMapScreen(0);
  const s2 = await buildListScreen((SW + GAP) * 1);
  const s3 = await buildCreateScreen((SW + GAP) * 2);
  const s4 = await buildDetailScreen((SW + GAP) * 3);

  figma.viewport.scrollAndZoomIntoView([s1, s2, s3, s4]);
  figma.notify('✅ Vagabondo – 4 screens generated!', { timeout: 4000 });
  figma.closePlugin();
}

run();
