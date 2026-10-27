import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';
import WORDS from '../public/words.json';

const { fontFamily: INTER } = loadInter('normal', { weights: ['500', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: SERIF } = loadSerif('italic', { weights: ['400'], subsets: ['latin'] });

// Landing-page palette: near-black violet, one violet accent, pink only inside the "match" gradient.
const C = {
  bg: '#0b0614',
  card: '#151021',
  violet: '#7c3aed',
  violetLight: '#c4b5fd',
  pink: '#ec4899',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.62)',
  red: '#f43f5e',
};

const FPS = 30;
type Word = { word: string; start: number; end: number };
const W = WORDS as Word[];
const clean = (w: string) => w.replace(/["“”…]/g, '');
const bare = (w: string) => clean(w).replace(/[.,:!?]$/, '');
// Frame of the n-th (1-based) occurrence of a spoken word (case-sensitive).
const at = (word: string, n = 1) => {
  const hits = W.filter((x) => bare(x.word) === word);
  if (!hits[n - 1]) throw new Error(`word not found: ${word} #${n}`);
  return Math.round(hits[n - 1].start * FPS);
};

const S = {
  hookEnd: at('Dating') - 2,
  guyCut: at('Most'),
  mysteryEnd: at('We') - 2,
  discEnd: at('What') - 2,
  teaseEnd: at('No') - 2,
  objEnd: at('One') - 2,
  proofEnd: at("It's") - 2,
  end: 900,
};

const ease = Easing.out(Easing.cubic);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const fadeIn = (f: number, start: number, dur = 6) => interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: ease });
const pop = (f: number, start: number, fps: number) => spring({ frame: f - start, fps, config: { damping: 13, stiffness: 200 } });
// Small camera shake that decays after an impact.
const shake = (f: number, start: number, amp = 18) => {
  const t = f - start;
  if (t < 0 || t > 10) return 'translate(0px,0px)';
  const k = amp * (1 - t / 10);
  return `translate(${Math.sin(t * 2.7) * k}px, ${Math.cos(t * 3.1) * k}px)`;
};

// ---------- Captions ----------
type Chunk = { words: Word[]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, from: Math.round(cur[0].start * FPS), to: 0 });
    cur = [];
  };
  for (const w of W) {
    cur.push(w);
    const len = cur.map((x) => clean(x.word)).join(' ').length;
    if (/[.,:!?"…]$/.test(w.word) || cur.length >= 3 || len > 15) flush();
  }
  flush();
  out.forEach((c, i) => (c.to = i + 1 < out.length ? Math.min(out[i + 1].from, c.from + 75) : c.from + 30));
  return out;
})();
const CAPTIONS_HIDDEN: [number, number][] = [
  [S.discEnd, S.objEnd],
  [S.proofEnd, S.end],
];
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  if (CAPTIONS_HIDDEN.some(([a, b]) => frame >= a && frame < b)) return null;
  const c = CHUNKS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const s = interpolate(frame - c.from, [0, 4], [0.88, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', left: 72, right: 140, top: 1400, transform: `scale(${s})`, transformOrigin: 'left center', fontFamily: INTER, fontWeight: 900, fontSize: 82, lineHeight: 1.02, letterSpacing: -1.5, color: C.white, textTransform: 'uppercase' }}>
      {c.words.map((w, i) => {
        const active = frame >= Math.round(w.start * FPS) && (i === c.words.length - 1 || frame < Math.round(c.words[i + 1].start * FPS));
        return (
          <span key={i} style={{ color: active ? C.violetLight : C.white }}>
            {clean(w.word)}
            {i < c.words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Shared bits ----------
const Glow: React.FC<{ x?: string; y?: string; o?: number }> = ({ x = '70%', y = '30%', o = 0.4 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${x} ${y}, rgba(124,58,237,${o}), rgba(11,6,20,0) 70%)` }} />
);
const Shade: React.FC = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 74%, rgba(0,0,0,0.5) 100%)' }} />
);
const Scan: React.FC<{ o?: number }> = ({ o = 0.08 }) => (
  <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,${o}) 0px, rgba(255,255,255,${o}) 1px, transparent 1px, transparent 4px)`, pointerEvents: 'none' }} />
);
const Heart: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.5 5c2.1 0 3.6 1.2 4.5 2.6C11.9 6.2 13.4 5 15.5 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} />
  </svg>
);
const Lock: React.FC<{ size: number; open?: number; color?: string }> = ({ size, open = 0, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={`M7 11V8a5 5 0 0 1 ${10 - open * 0}${open > 0.5 ? ' 0' : ' 0v3'}`} transform={`translate(${open > 0.5 ? 4 : 0} ${-open * 2})`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="4" y="11" width="16" height="10" rx="2.5" fill={color} />
  </svg>
);
const Tag: React.FC<{ text: string; color: string; bg: string; style?: React.CSSProperties }> = ({ text, color, bg, style }) => (
  <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 999, background: bg, color, fontFamily: INTER, fontWeight: 800, fontSize: 26, letterSpacing: 4, ...style }}>{text}</div>
);
const Note: React.FC<{ text: string; top: number; left?: number }> = ({ text, top, left = 72 }) => (
  <div style={{ position: 'absolute', top, left, fontFamily: INTER, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.55)' }}>{text}</div>
);
const Stamp: React.FC<{ s: number; size?: number; rot?: number; text?: string }> = ({ s, size = 64, rot = -8, text = 'CLASSIFIED' }) => (
  <div style={{ transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`, opacity: Math.min(1, s * 1.5), padding: '8px 22px', border: `6px solid ${C.red}`, borderRadius: 12, color: C.red, fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: 6, mixBlendMode: 'screen' }}>{text}</div>
);
const useExit = (dur: number, kind: 'zoom' | 'glitch' | 'up' = 'zoom') => {
  const f = useCurrentFrame();
  const p = interpolate(f, [dur - 6, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (kind === 'glitch') {
    const jitter = p > 0 ? Math.sin(f * 7) * 40 * p : 0;
    return { transform: `translateX(${jitter}px) skewX(${p * 12}deg)`, opacity: 1 - p, filter: `hue-rotate(${p * 90}deg) blur(${p * 6}px)` };
  }
  const t = kind === 'zoom' ? `scale(${1 + p * 0.3})` : `translateY(${-p * 700}px)`;
  return { transform: t, opacity: 1 - p, filter: `blur(${p * 16}px)` };
};

// ---------- 1. HOOK: lock screen flooding with matches + "Secret Optimization" reveal ----------
const NOTIF_TIMES = [2, 7, 11, 15, 19, 22, 25, 28, 31, 34];
const Notif: React.FC<{ i: number }> = ({ i }) => {
  const ago = ['now', 'now', '1m ago', '2m ago', '4m ago', '9m ago', '12m ago', '20m ago', '31m ago', '45m ago'][i];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, height: 112, padding: '0 22px', borderRadius: 30, background: 'rgba(255,255,255,0.86)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', fontFamily: INTER }}>
      <div style={{ width: 66, height: 66, borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Heart size={38} color="#fff" filled />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 28, color: '#14101f' }}>New match!</span>
          <span style={{ fontWeight: 500, fontSize: 22, color: 'rgba(20,16,31,0.5)' }}>{ago}</span>
        </div>
        <div style={{ fontWeight: 500, fontSize: 26, color: 'rgba(20,16,31,0.75)' }}>Someone liked you back 😍</div>
      </div>
    </div>
  );
};
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S.hookEnd;
  const secret = at('Secret');
  const opt = at('Optimization');
  const look = at('look');
  const matches = at('matches');
  const shown = NOTIF_TIMES.filter((t) => f >= t).length;
  const phoneIn = spring({ frame: f, fps, config: { damping: 18, stiffness: 220 } });
  // Title: redaction bar glitches away to reveal the words.
  const titleIn = pop(f, secret - 2, fps);
  const reveal = interpolate(f, [secret + 2, opt + 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glitch = f >= secret - 2 && f < secret + 6 ? Math.sin(f * 9) * 14 : 0;
  const stamp = pop(f, opt + 10, fps);
  const zoom = interpolate(f, [look, matches + 6], [1, 1.12], { ...clamp, easing: ease });
  const matchPop = spring({ frame: f - matches, fps, config: { damping: 10, stiffness: 220 } });
  const dimPhone = interpolate(f, [secret - 2, secret + 4], [1, 0.22], clamp);
  const blurPhone = interpolate(f, [secret - 2, secret + 4], [0, 8], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'glitch') }}>
      <Glow x="50%" y="35%" o={0.45} />
      <AbsoluteFill style={{ transform: `${shake(f, 0, 22)} ${shake(f, matches, 14)} scale(${zoom})` }}>
        {/* Phone lock screen, recreated generically (no third-party app UI) */}
        <div style={{ position: 'absolute', left: 120, top: 150, width: 840, height: 1190, borderRadius: 70, overflow: 'hidden', border: '12px solid #1f1a2e', transform: `translateY(${(1 - phoneIn) * 300}px)`, opacity: dimPhone, filter: `blur(${blurPhone}px)`, background: 'linear-gradient(160deg, #3b1d6e 0%, #1a0f30 45%, #0b0614 100%)' }}>
          <div style={{ textAlign: 'center', marginTop: 70, fontFamily: INTER, fontWeight: 300, fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>Friday, October 24</div>
          <div style={{ textAlign: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 170, letterSpacing: -4, color: C.white, lineHeight: 1 }}>10:24</div>
          <div style={{ position: 'absolute', left: 26, right: 26, top: 330, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Array.from({ length: shown }).map((_, k) => {
              const idx = shown - 1 - k; // newest on top
              const born = NOTIF_TIMES[idx];
              const s = spring({ frame: f - born, fps, config: { damping: 16, stiffness: 260 } });
              return (
                <div key={idx} style={{ transform: `translateY(${(1 - s) * -60}px) scale(${0.92 + s * 0.08})`, opacity: s }}>
                  <Notif i={Math.min(k, 9)} />
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      {/* Title */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 520, textAlign: 'center', transform: `translateX(${glitch}px) scale(${interpolate(titleIn, [0, 1], [1.6, 1])})`, opacity: Math.min(1, titleIn * 1.4) }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: C.violetLight }}>GUYS ARE USING</div>
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 10 }}>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 118, lineHeight: 0.95, letterSpacing: -3, color: C.white, textShadow: `0 0 50px rgba(124,58,237,0.9)` }}>
            THE SECRET
            <br />
            <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 150, letterSpacing: 0, color: C.violetLight }}>Optimization</span>
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: `${(1 - reveal) * 100}%`, background: '#000', borderLeft: reveal > 0 && reveal < 1 ? `6px solid ${C.violet}` : 'none' }} />
        </div>
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <Stamp s={stamp} size={52} />
        </div>
      </div>
      {/* "It's a match!" kinetic slam (style of the reference, recreated in brand colours) */}
      {f >= matches && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', transform: `scale(${interpolate(matchPop, [0, 1], [2.4, 1])}) rotate(-4deg)`, opacity: Math.min(1, matchPop * 2) }}>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontStyle: 'italic', fontSize: 40, letterSpacing: 4, color: C.white }}>IT'S A</div>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontStyle: 'italic', fontSize: 170, lineHeight: 0.9, letterSpacing: -4, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})`, WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 30px rgba(236,72,153,0.5))' }}>MATCH!</div>
        </div>
      )}
      <Note text="Dramatization" top={1350} />
      <Scan o={0.04} />
    </AbsoluteFill>
  );
};

// ---------- 2. MYSTERY: who gets shown first? ----------
const TILE_IMGS = ['before.jpg', 'after.jpg', 'happy.jpg'];
const Mystery: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.hookEnd;
  const dur = S.mysteryEnd - o;
  const guy = S.guyCut - o;
  const sort = interpolate(f, [at('decide') - o, at('first') - o + 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const q = pop(f, guy + 6, fps);
  const cards = Array.from({ length: 7 });
  const winners = new Set([1, 4]);
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'zoom') }}>
      <Glow x="50%" y="25%" o={0.35} />
      {f < guy ? (
        <>
          <div style={{ position: 'absolute', left: 72, top: 236 }}>
            <Tag text="WHO SEES YOU FIRST?" color={C.violetLight} bg="rgba(124,58,237,0.18)" />
          </div>
          {cards.map((_, i) => {
            const win = winners.has(i);
            const startY = 360 + i * 120;
            const rank = win ? (i === 1 ? 0 : 1) : 2 + i;
            const y = interpolate(sort, [0, 1], [startY, win ? 360 + rank * 330 : 1120 + (i % 3) * 60]);
            const x = win ? 140 : 160 + (i % 3) * 60;
            return (
              <div key={i} style={{ position: 'absolute', left: x, top: y, width: 800, height: 300, borderRadius: 28, overflow: 'hidden', border: win ? `3px solid ${C.violet}` : '1px solid rgba(255,255,255,0.1)', boxShadow: win ? `0 0 ${50 * sort}px rgba(124,58,237,0.7)` : 'none', opacity: win ? 1 : 1 - sort * 0.75, zIndex: win ? 2 : 1, transform: `scale(${win ? 1 : 1 - sort * 0.12})`, background: C.card }}>
                <Img src={staticFile(TILE_IMGS[i % 3])} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', filter: `blur(${win ? 0 : 6}px) saturate(${win ? 1 : 0.5})` }} />
                {win && sort > 0.6 && <Tag text="SHOWN FIRST" color={C.white} bg={C.violet} style={{ position: 'absolute', left: 18, top: 18 }} />}
                {!win && sort > 0.6 && <Tag text="BURIED" color={C.white} bg="rgba(0,0,0,0.6)" style={{ position: 'absolute', left: 18, top: 18, fontSize: 20 }} />}
              </div>
            );
          })}
        </>
      ) : (
        <>
          <AbsoluteFill style={{ transform: `scale(${interpolate(f, [guy, dur], [1.08, 1.16])})` }}>
            <OffthreadVideo src={staticFile('shotA_full.mp4')} startFrom={95} muted style={{ width: 1080, height: 1920, objectFit: 'cover', filter: 'saturate(0.8) contrast(1.05)' }} />
          </AbsoluteFill>
          <Shade />
          <div style={{ position: 'absolute', right: 110, top: 260, transform: `scale(${q}) rotate(8deg)`, fontFamily: SERIF, fontStyle: 'italic', fontSize: 260, color: C.violetLight, textShadow: '0 0 40px rgba(124,58,237,0.8)' }}>?</div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- 3. DISCOVERY: 1M profiles scanned ----------
const Discovery: React.FC = () => {
  const f = useCurrentFrame();
  const o = S.mysteryEnd;
  const dur = S.discEnd - o;
  const count = Math.round(interpolate(f, [2, at('profiles') - o + 6], [0, 1000000], { ...clamp, easing: Easing.out(Easing.quad) }));
  const topOn = fadeIn(f, at('everyone') - o, 6);
  const link = interpolate(f, [at('same') - o, at('same') - o + 10], [0, 1], clamp);
  const scanY = interpolate(f % 40, [0, 40], [560, 1200]);
  const TOP = [1, 6, 8];
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'glitch') }}>
      <Glow x="50%" y="40%" o={0.35} />
      <div style={{ position: 'absolute', left: 72, top: 236 }}>
        <Tag text="● LIVE ANALYSIS" color={C.violetLight} bg="rgba(124,58,237,0.18)" />
        <div style={{ marginTop: 18, fontFamily: INTER, fontWeight: 900, fontSize: 116, letterSpacing: -3, color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          {count.toLocaleString('en-US')}
          {count >= 1000000 ? '+' : ''}
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: C.muted }}>PROFILES ANALYZED</div>
      </div>
      <div style={{ position: 'absolute', left: 72, top: 560, width: 936, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const isTop = TOP.includes(i);
          return (
            <div key={i} style={{ position: 'relative', height: 200, borderRadius: 18, overflow: 'hidden', opacity: fadeIn(f, i, 6) * (topOn > 0 && !isTop ? 1 - topOn * 0.7 : 1), border: isTop ? `${3 * topOn}px solid ${C.violet}` : '1px solid rgba(255,255,255,0.08)', boxShadow: isTop ? `0 0 ${40 * topOn}px rgba(124,58,237,0.8)` : 'none' }}>
              <Img src={staticFile(TILE_IMGS[i % 3])} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${isTop ? 6 * (1 - topOn) + 1 : 8}px) saturate(0.7)` }} />
              {isTop && topOn > 0.4 && <Tag text="TOP" color={C.white} bg={C.violet} style={{ position: 'absolute', left: 8, top: 8, fontSize: 18, padding: '5px 12px' }} />}
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: scanY - 560, height: 4, background: C.violetLight, boxShadow: `0 0 30px 8px rgba(124,58,237,0.7)`, opacity: 1 - topOn * 0.6 }} />
      </div>
      {link > 0 && (
        <div style={{ position: 'absolute', left: 72, top: 1230, opacity: link, transform: `translateY(${(1 - link) * 20}px)`, display: 'flex', gap: 12 }}>
          {['SAME PHOTOS', 'SAME SETTINGS', 'SAME SIGNALS'].map((t) => (
            <Tag key={t} text={t} color={C.white} bg="rgba(124,58,237,0.35)" style={{ fontSize: 22, letterSpacing: 2 }} />
          ))}
        </div>
      )}
      <Scan o={0.04} />
    </AbsoluteFill>
  );
};

// ---------- 4. TEASE: the classified list (mirrors Module 03 on the page) ----------
const ITEMS: { n: string; t: string; word: string; nth: number }[] = [
  { n: '01', t: 'What decides who sees you first', word: 'What', nth: 1 },
  { n: '02', t: 'The settings nobody touches', word: 'settings', nth: 1 },
  { n: '03', t: 'The signals that move you up', word: 'signals', nth: 1 },
];
const Tease: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.discEnd;
  const dur = S.teaseEnd - o;
  const head = pop(f, 0, fps);
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'zoom') }}>
      <Glow x="30%" y="20%" o={0.45} />
      <div style={{ position: 'absolute', left: 72, top: 236, transform: `scale(${head})`, transformOrigin: 'left center' }}>
        <Tag text="MODULE 03 · THE SECRET" color={C.violetLight} bg="rgba(124,58,237,0.18)" />
        <div style={{ marginTop: 22, fontFamily: INTER, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: -2.5, color: C.white }}>
          What the apps
          <br />
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 110, color: C.violetLight }}>don't tell you.</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 72, right: 72, top: 640, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {ITEMS.map((it) => {
          const st = at(it.word, it.nth) - o;
          const appear = pop(f, st - 2, fps);
          const type = interpolate(f, [st, st + 14], [0, it.t.length], clamp);
          const redact = interpolate(f, [st + 16, st + 21], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
          const stamp = pop(f, st + 21, fps);
          return (
            <div key={it.n} style={{ position: 'relative', opacity: Math.min(1, appear * 1.5), transform: `translateX(${(1 - appear) * -80}px) ${shake(f, st + 21, 8)}`, display: 'flex', alignItems: 'center', gap: 22, padding: '30px 30px', borderRadius: 26, background: C.card, border: '1.5px solid rgba(124,58,237,0.5)', minHeight: 150 }}>
              <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 48, color: C.violetLight }}>{it.n}</div>
              <div style={{ position: 'relative', flex: 1, fontFamily: INTER, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: C.white }}>
                {it.t.slice(0, Math.floor(type))}
                <div style={{ position: 'absolute', left: 0, top: -6, bottom: -6, width: `${redact * 100}%`, background: '#000', borderRadius: 6 }} />
              </div>
              <div style={{ width: 70, display: 'flex', justifyContent: 'center', opacity: redact }}>
                <Lock size={54} color={C.violetLight} />
              </div>
              <div style={{ position: 'absolute', right: 120, top: 34 }}>
                <Stamp s={stamp} size={40} rot={-10} />
              </div>
            </div>
          );
        })}
      </div>
      <Scan o={0.035} />
    </AbsoluteFill>
  );
};

// ---------- 5. OBJECTIONS: no photographer, no subscription, 30 minutes ----------
const Objections: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.teaseEnd;
  const dur = S.objEnd - o;
  const lines = [
    { t: 'No photographer.', at: at('No', 1) - o, ok: false },
    { t: 'No premium subscription.', at: at('No', 2) - o, ok: false },
    { t: 'Thirty minutes.', at: at('Thirty') - o, ok: true },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'up') }}>
      <AbsoluteFill style={{ opacity: 0.14 }}>
        <Img src={staticFile('after.jpg')} style={{ width: 1080, height: 1920, objectFit: 'cover', objectPosition: '50% 15%', filter: 'blur(14px)' }} />
      </AbsoluteFill>
      <Glow x="50%" y="50%" o={0.5} />
      <div style={{ position: 'absolute', left: 72, right: 72, top: 420, display: 'flex', flexDirection: 'column', gap: 44 }}>
        {lines.map((l, i) => {
          const s = pop(f, l.at - 1, fps);
          const strike = interpolate(f, [l.at + 8, l.at + 14], [0, 1], clamp);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, transform: `scale(${s}) ${shake(f, l.at, 10)}`, transformOrigin: 'left center', opacity: Math.min(1, s * 1.4) }}>
              <div style={{ width: 96, height: 96, borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: l.ok ? C.violet : 'rgba(244,63,94,0.18)', border: `3px solid ${l.ok ? C.violet : C.red}`, fontFamily: INTER, fontWeight: 900, fontSize: 54, color: l.ok ? C.white : C.red }}>
                {l.ok ? '✓' : '✕'}
              </div>
              <div style={{ fontFamily: l.ok ? SERIF : INTER, fontStyle: l.ok ? 'italic' : 'normal', fontWeight: l.ok ? 400 : 900, fontSize: l.ok ? 120 : 76, lineHeight: 1, letterSpacing: l.ok ? 0 : -2, color: l.ok ? C.violetLight : C.white, position: 'relative' }}>
                {l.t}
                {!l.ok && <div style={{ position: 'absolute', left: 0, top: '52%', height: 8, width: `${strike * 100}%`, background: C.red, borderRadius: 4 }} />}
              </div>
            </div>
          );
        })}
      </div>
      <Scan o={0.03} />
    </AbsoluteFill>
  );
};

// ---------- 6. PROOF: real reaction + customer message ----------
const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.objEnd;
  const dur = S.proofEnd - o;
  const hl = at('10X', 1) - o;
  const phone = spring({ frame: f - 4, fps, config: { damping: 200 }, durationInFrames: 7 });
  const mark = interpolate(f, [hl, hl + 8], [0, 1], clamp);
  const zoom = interpolate(f, [hl - 4, hl + 6], [1, 1.08], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'zoom') }}>
      <AbsoluteFill style={{ filter: `blur(${phone * 10}px) brightness(${1 - phone * 0.5})`, transform: 'scale(1.05)' }}>
        <OffthreadVideo src={staticFile('happy.mp4')} muted style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 72, top: 236, opacity: phone }}>
        <Tag text="CUSTOMER MESSAGE" color={C.violetLight} bg="rgba(124,58,237,0.25)" />
      </div>
      <div style={{ position: 'absolute', left: 140, top: 330, width: 800, height: 760, borderRadius: 56, overflow: 'hidden', border: '10px solid #1f1a2e', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', background: '#f4f1ea', transform: `translateY(${(1 - phone) * 1400}px)` }}>
        <div style={{ transform: `translateY(-120px) scale(${zoom})`, transformOrigin: '50% 30%' }}>
          <Img src={staticFile('testimonial.jpg')} style={{ width: 800, display: 'block' }} />
          <div style={{ position: 'absolute', left: 55, top: 270, height: 46, width: 540 * mark, background: 'rgba(124,58,237,0.28)', borderRadius: 8, mixBlendMode: 'multiply' }} />
        </div>
      </div>
      <Note text="Individual result. Results vary." top={1110} left={140} />
    </AbsoluteFill>
  );
};

// ---------- 7. OFFER: unlock the secret ----------
const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.proofEnd;
  const unlockAt = at('Secret', 2) - o;
  const coverS = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 12 });
  const open = interpolate(f, [unlockAt, unlockAt + 6], [0, 1], clamp);
  const burst = interpolate(f, [unlockAt, unlockAt + 4, unlockAt + 18], [0, 0.9, 0], clamp);
  const lockGone = interpolate(f, [unlockAt + 6, unlockAt + 14], [1, 0], clamp);
  const price = pop(f, at('Just') - o, fps);
  const strike = interpolate(f, [at('Just') - o + 4, at('Just') - o + 10], [0, 1], clamp);
  const cta = pop(f, at('Tap') - o, fps);
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - (at('Tap') - o)) * 0.4);
  const arrow = Math.abs(Math.sin(f / 6)) * 14;
  const float = Math.sin(f / 14) * 8;
  return (
    <AbsoluteFill style={{ background: C.bg, transform: shake(f, unlockAt, 16) }}>
      <Glow x="50%" y="28%" o={0.5 + burst * 0.4} />
      <div style={{ position: 'absolute', left: 215, top: 200 + float, width: 650, height: 650, transform: `perspective(1400px) rotateY(${(1 - coverS) * -25}deg) scale(${0.85 + coverS * 0.15})`, opacity: coverS }}>
        <Img src={staticFile('cover.jpg')} style={{ width: 650, height: 650, borderRadius: 24, filter: `blur(${(1 - open) * 14}px) brightness(${0.55 + open * 0.45})` }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: lockGone, transform: `scale(${1 + open * 0.4})` }}>
          <Lock size={170} open={open} color={C.white} />
          <div style={{ marginTop: 10, fontFamily: INTER, fontWeight: 900, fontSize: 34, letterSpacing: 8, color: C.white }}>{open > 0.5 ? 'UNLOCKED' : 'LOCKED'}</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, rgba(255,255,255,${burst * 0.6}), rgba(124,58,237,${burst * 0.5}) 40%, rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: C.white, opacity: open }}>
        THE SECRET OPTIMIZATION · 20 PHOTO SETUPS · 50 BIOS
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 980, textAlign: 'center', transform: `scale(${price})`, opacity: Math.min(1, price), fontFamily: INTER }}>
        <span style={{ position: 'relative', fontWeight: 700, fontSize: 56, color: C.muted, marginRight: 24 }}>
          $49
          <span style={{ position: 'absolute', left: -4, top: '52%', height: 5, width: `${strike * 110}%`, background: C.red }} />
        </span>
        <span style={{ fontWeight: 900, fontSize: 130, letterSpacing: -3, color: C.white }}>$9.90</span>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.violetLight }}>ONE-TIME · INSTANT ACCESS · 7-DAY GUARANTEE</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta * pulse})`, opacity: Math.min(1, cta) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '32px 60px', borderRadius: 999, background: `linear-gradient(90deg, ${C.violet}, #9b5cf6)`, boxShadow: '0 18px 70px rgba(124,58,237,0.7)', fontFamily: INTER, fontWeight: 900, fontSize: 50, color: C.white, letterSpacing: 1 }}>
          <Lock size={44} open={1} /> UNLOCK IT NOW
        </div>
        <svg width="58" height="58" viewBox="0 0 24 24" style={{ marginTop: 8 + arrow }}>
          <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke={C.violetLight} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <Scan o={0.03} />
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at: a, src, volume }) => (
  <Sequence from={Math.max(0, a)} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

const Music: React.FC = () => {
  const f = useCurrentFrame();
  // Music bed under the voice; swells on the unlock and fades at the end.
  const unlock = at('Secret', 2);
  const v = interpolate(f, [0, 6, unlock - 4, unlock + 2, 780, 870, 900], [0.0, 0.2, 0.2, 0.32, 0.26, 0.26, 0], clamp);
  return <Audio src={staticFile('music.wav')} volume={() => v} />;
};

export const AdSecret: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={S.hookEnd}>
      <Hook />
    </Sequence>
    <Sequence from={S.hookEnd} durationInFrames={S.mysteryEnd - S.hookEnd}>
      <Mystery />
    </Sequence>
    <Sequence from={S.mysteryEnd} durationInFrames={S.discEnd - S.mysteryEnd}>
      <Discovery />
    </Sequence>
    <Sequence from={S.discEnd} durationInFrames={S.teaseEnd - S.discEnd}>
      <Tease />
    </Sequence>
    <Sequence from={S.teaseEnd} durationInFrames={S.objEnd - S.teaseEnd}>
      <Objections />
    </Sequence>
    <Sequence from={S.objEnd} durationInFrames={S.proofEnd - S.objEnd}>
      <Proof />
    </Sequence>
    <Sequence from={S.proofEnd}>
      <Offer />
    </Sequence>
    <Captions />

    <Music />
    <Audio src={staticFile('vo.wav')} />
    {/* Hook: impact + notification flood + glitch reveal + stamp + match slam */}
    <Sfx at={0} src="hit_sub.mp3" volume={0.55} />
    {NOTIF_TIMES.slice(0, 6).map((t) => (
      <Sfx key={t} at={t} src="notif.mp3" volume={0.16} />
    ))}
    <Sfx at={at('Secret') - 3} src="glitch1.mp3" volume={0.45} />
    <Sfx at={at('Optimization') + 10} src="stamp.mp3" volume={0.5} />
    <Sfx at={at('matches') - 2} src="whoosh.mp3" volume={0.4} />
    <Sfx at={at('matches')} src="boom_low.mp3" volume={0.45} />
    {/* Mystery */}
    <Sfx at={S.hookEnd - 3} src="glitch2.mp3" volume={0.4} />
    <Sfx at={at('decide')} src="whoosh_short.mp3" volume={0.4} />
    <Sfx at={S.guyCut - 2} src="whoosh.mp3" volume={0.35} />
    {/* Discovery */}
    <Sfx at={S.mysteryEnd - 3} src="whoosh.mp3" volume={0.35} />
    <Sfx at={at('everyone')} src="notif.mp3" volume={0.25} />
    {/* Tease: each item redacted + stamped + locked */}
    <Sfx at={S.discEnd - 3} src="glitch1.mp3" volume={0.4} />
    {ITEMS.map((it) => (
      <React.Fragment key={it.n}>
        <Sfx at={at(it.word, it.nth) + 16} src="glitch2.mp3" volume={0.35} />
        <Sfx at={at(it.word, it.nth) + 21} src="stamp.mp3" volume={0.45} />
        <Sfx at={at(it.word, it.nth) + 23} src="lock.mp3" volume={0.5} />
      </React.Fragment>
    ))}
    {/* Objections */}
    <Sfx at={at('No', 1)} src="whoosh_short.mp3" volume={0.4} />
    <Sfx at={at('No', 2)} src="whoosh_short.mp3" volume={0.4} />
    <Sfx at={at('Thirty')} src="hit_sub.mp3" volume={0.35} />
    {/* Proof */}
    <Sfx at={S.objEnd + 8} src="whoosh.mp3" volume={0.35} />
    <Sfx at={at('10X', 1)} src="notif.mp3" volume={0.3} />
    {/* Offer: riser into unlock, price hit, CTA */}
    <Sfx at={at('Secret', 2) - 79} src="riser_hit.mp3" volume={0.4} />
    <Sfx at={at('Secret', 2)} src="unlock.mp3" volume={0.55} />
    <Sfx at={at('Just')} src="boom_low.mp3" volume={0.35} />
    <Sfx at={at('Tap')} src="whoosh_short.mp3" volume={0.35} />
  </AbsoluteFill>
);
