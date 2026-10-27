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

// Landing-page palette: near-black violet + one violet accent.
const C = {
  bg: '#0b0614',
  card: '#151021',
  violet: '#7c3aed',
  violetLight: '#c4b5fd',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.62)',
  red: '#f43f5e',
};

const FPS = 30;
type Word = { word: string; start: number; end: number };
const W = WORDS as Word[];
const clean = (w: string) => w.replace(/["“”]/g, '');
// Frame of the n-th (1-based) occurrence of a spoken word.
const at = (word: string, n = 1) => {
  const hits = W.filter((x) => clean(x.word).replace(/[.,:!?]$/, '').toLowerCase() === word.toLowerCase());
  return Math.round(hits[n - 1].start * FPS);
};

// Scene boundaries (frames), anchored to the voiceover.
const S = {
  hookEnd: at('Before'),
  beforeCardEnd: at('It'),
  mechStart: at('We'),
  transStart: at('He'),
  happyStart: at('Then') - 4,
  testiStart: at('One'),
  offerStart: at('10X', 2) - 3,
  end: 900,
};

const ease = Easing.out(Easing.cubic);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const fadeIn = (f: number, start: number, dur = 6) => interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: ease });
const pop = (f: number, start: number, fps: number) => spring({ frame: f - start, fps, config: { damping: 15, stiffness: 190 } });

// ---------- Captions: 1–3 word chunks, current word in the accent colour ----------
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
    if (/[.,:!?"]$/.test(w.word) || cur.length >= 3 || len > 16) flush();
  }
  flush();
  out.forEach((c, i) => (c.to = i + 1 < out.length ? out[i + 1].from : c.from + 30));
  return out;
})();
const CAPTIONS_HIDDEN: [number, number][] = [
  [0, S.hookEnd],
  [S.offerStart, S.end],
];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  if (CAPTIONS_HIDDEN.some(([a, b]) => frame >= a && frame < b)) return null;
  const c = CHUNKS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const local = frame - c.from;
  const s = interpolate(local, [0, 4], [0.9, 1], { ...clamp, easing: ease });
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 140,
        top: 1395,
        transform: `scale(${s})`,
        transformOrigin: 'left center',
        fontFamily: INTER,
        fontWeight: 900,
        fontSize: 84,
        lineHeight: 1.02,
        letterSpacing: -1.5,
        color: C.white,
        textTransform: 'uppercase',
      }}
    >
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
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 74%, rgba(0,0,0,0.45) 100%)' }} />
);
const Heart: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.5 5c2.1 0 3.6 1.2 4.5 2.6C11.9 6.2 13.4 5 15.5 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={2}
    />
  </svg>
);
const Tag: React.FC<{ text: string; color: string; bg: string; style?: React.CSSProperties }> = ({ text, color, bg, style }) => (
  <div
    style={{
      display: 'inline-block',
      padding: '10px 22px',
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: INTER,
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: 4,
      ...style,
    }}
  >
    {text}
  </div>
);
const Note: React.FC<{ text: string; top: number; left?: number }> = ({ text, top, left = 72 }) => (
  <div style={{ position: 'absolute', top, left, fontFamily: INTER, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.55)' }}>{text}</div>
);
// Scene exit: quick scale + fade so cuts feel like transitions.
const useExit = (dur: number, kind: 'zoom' | 'left' | 'up' = 'zoom') => {
  const f = useCurrentFrame();
  const p = interpolate(f, [dur - 6, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const t = kind === 'zoom' ? `scale(${1 + p * 0.25})` : kind === 'left' ? `translateX(${-p * 1080}px)` : `translateY(${-p * 600}px)`;
  return { transform: t, opacity: 1 - p * (kind === 'zoom' ? 1 : 0.4), filter: `blur(${p * 16}px)` };
};
const useEnter = (kind: 'right' | 'up' | 'zoom' = 'right') => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 9 });
  if (kind === 'right') return { transform: `translateX(${(1 - s) * 1080}px)` };
  if (kind === 'up') return { transform: `translateY(${(1 - s) * 1920}px)` };
  return { transform: `scale(${1.3 - 0.3 * s})`, opacity: s };
};

// ---------- 1. Hook: same guy, split before/after ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S.hookEnd;
  const split = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 10 });
  const l1 = fadeIn(f, at('Same') - 2, 4);
  const l2 = fadeIn(f, at('Same', 2) - 2, 4);
  const l3 = fadeIn(f, at('Completely') - 2, 5);
  const hearts = [0, 1, 2, 3].map((i) => {
    const st = 18 + i * 14;
    const p = interpolate(f, [st, st + 26], [0, 1], clamp);
    return { p, x: 690 + (i % 2) * 120, d: i };
  });
  const panel = (img: string, side: 'l' | 'r'): React.CSSProperties => ({
    position: 'absolute',
    top: 600,
    left: side === 'l' ? 0 : 540,
    width: 540,
    height: 800,
    overflow: 'hidden',
    transform: `translateX(${(1 - split) * (side === 'l' ? -540 : 540)}px)`,
  });
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'left') }}>
      <Glow x="80%" y="55%" o={0.35} />
      <div style={{ position: 'absolute', left: 72, top: 236, fontFamily: INTER, fontWeight: 900, fontSize: 104, lineHeight: 0.98, letterSpacing: -3, color: C.white }}>
        <div style={{ opacity: l1 }}>Same guy.</div>
        <div style={{ opacity: l2 }}>Same face.</div>
      </div>
      <div style={{ position: 'absolute', left: 72, top: 450, fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: C.violetLight, opacity: l3, transform: `translateY(${(1 - l3) * 20}px)` }}>
        Completely different results.
      </div>
      <div style={panel('before.jpg', 'l')}>
        <Img src={staticFile('before.jpg')} style={{ width: 540, height: 800, objectFit: 'cover', objectPosition: '50% 20%', filter: 'saturate(0.6) brightness(0.85)' }} />
        <Tag text="BEFORE" color={C.white} bg="rgba(0,0,0,0.6)" style={{ position: 'absolute', left: 24, top: 24 }} />
        <div style={{ position: 'absolute', left: 24, bottom: 28, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 999, background: 'rgba(20,16,31,0.85)', fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.white }}>
          <Heart size={30} color="rgba(255,255,255,0.5)" /> 0 matches
        </div>
      </div>
      <div style={panel('after.jpg', 'r')}>
        <Img src={staticFile('after.jpg')} style={{ width: 540, height: 800, objectFit: 'cover', objectPosition: '50% 15%' }} />
        <Tag text="AFTER" color={C.white} bg={C.violet} style={{ position: 'absolute', left: 24, top: 24 }} />
        <div style={{ position: 'absolute', left: 24, bottom: 28, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 999, background: C.violet, fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.white }}>
          <Heart size={30} color="#fff" filled /> New matches
        </div>
      </div>
      {hearts.map((h) =>
        h.p > 0 && h.p < 1 ? (
          <div key={h.d} style={{ position: 'absolute', left: h.x, top: 1220 - h.p * 520, opacity: 1 - h.p, transform: `scale(${0.8 + h.p * 0.6})` }}>
            <Heart size={64} color="#fff" filled />
          </div>
        ) : null,
      )}
      <div style={{ position: 'absolute', left: 538, top: 600, width: 4, height: 800 * split, background: C.white, boxShadow: `0 0 24px ${C.violet}` }} />
      <Note text="Dramatization" top={1420} />
    </AbsoluteFill>
  );
};

// ---------- 2. Before: profile breakdown, then the real frustrated guy ----------
const ProfileCard: React.FC<{ after: number; bioAfter: number; ring?: number; underline?: number }> = ({ after, bioAfter, ring = 0, underline = 0 }) => (
  <div style={{ position: 'relative', width: 760, height: 900, borderRadius: 40, overflow: 'hidden', background: C.card, border: '1.5px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}>
    <Img src={staticFile('before.jpg')} style={{ position: 'absolute', width: 760, height: 620, objectFit: 'cover', objectPosition: '50% 25%' }} />
    <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - after) * 760}px 0 0)` }}>
      <Img src={staticFile('after.jpg')} style={{ position: 'absolute', width: 760, height: 620, objectFit: 'cover', objectPosition: '50% 12%' }} />
    </div>
    {after > 0 && after < 1 && <div style={{ position: 'absolute', left: after * 760 - 3, top: 0, width: 6, height: 620, background: C.white, boxShadow: `0 0 20px ${C.violet}` }} />}
    <div style={{ position: 'absolute', left: 0, top: 460, width: 760, height: 160, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.7))' }} />
    <div style={{ position: 'absolute', left: 36, top: 540, fontFamily: INTER, fontWeight: 800, fontSize: 54, color: C.white }}>
      Ryan <span style={{ fontWeight: 500, opacity: 0.85 }}>31</span>
    </div>
    {ring > 0 && <div style={{ position: 'absolute', inset: 10, height: 600, borderRadius: 32, border: `6px solid ${C.red}`, opacity: ring }} />}
    <div style={{ position: 'absolute', left: 36, right: 36, top: 650 }}>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: bioAfter > 0.5 ? C.violetLight : C.muted }}>MY BIO</div>
      <div style={{ position: 'relative', marginTop: 10, fontFamily: INTER, fontWeight: 500, fontSize: 32, lineHeight: 1.3, color: bioAfter > 0.5 ? C.white : 'rgba(255,255,255,0.55)' }}>
        {bioAfter > 0.5 ? 'Terrible at karaoke. Great at finding the best ramen in any city. Your go-to order?' : 'Not good at bios. Love travel, food and good vibes. Just ask.'}
        {underline > 0 && <div style={{ position: 'absolute', left: 0, bottom: -10, height: 6, width: `${underline * 100}%`, background: C.red, borderRadius: 3 }} />}
      </div>
    </div>
  </div>
);

const Before: React.FC = () => {
  const f = useCurrentFrame(); // local; 0 = S.hookEnd
  const { fps } = useVideoConfig();
  const o = S.hookEnd;
  const cardOut = S.beforeCardEnd - o;
  const enter = useEnter('right');
  const ring = fadeIn(f, at('dark') - o, 5);
  const underline = interpolate(f, [at('forgettable') - o, at('forgettable') - o + 10], [0, 1], clamp);
  const zero = pop(f, at('zero') - o, fps);
  const cardExit = interpolate(f, [cardOut - 6, cardOut], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const vidZ = interpolate(f, [cardOut, S.mechStart - o], [1.0, 1.12], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Real footage plays from the start; the card sits over a blurred copy, then clears. */}
      <AbsoluteFill style={{ transform: `scale(${vidZ})`, filter: `blur(${(1 - cardExit) * 18}px) brightness(${0.55 + cardExit * 0.45})` }}>
        <OffthreadVideo src={staticFile('shotA_full.mp4')} muted style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
      </AbsoluteFill>
      <Shade />
      <div style={{ position: 'absolute', left: 160, top: 300, ...enter, opacity: 1 - cardExit, transform: `${enter.transform} scale(${1 - cardExit * 0.2})` }}>
        <Tag text="BEFORE" color={C.white} bg="rgba(0,0,0,0.6)" style={{ position: 'absolute', left: 24, top: 24, zIndex: 2 }} />
        <ProfileCard after={0} bioAfter={0} ring={ring} underline={underline} />
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: 470,
            transform: `scale(${zero})`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 26px',
            borderRadius: 24,
            background: C.white,
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 36,
            color: '#14101f',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          }}
        >
          <Heart size={34} color={C.red} /> 0 matches
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Mechanism: 1M+ profiles, top ones do 3 things ----------
const TILE_IMGS = ['before.jpg', 'after.jpg', 'happy.jpg', 'before.jpg', 'after.jpg', 'happy.jpg'];
const Mechanism: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.mechStart;
  const dur = S.transStart - o;
  const count = Math.round(interpolate(f, [4, at('profiles') - o + 6], [0, 1000000], { ...clamp, easing: Easing.out(Easing.quad) }));
  const topOn = fadeIn(f, at('top') - o, 6);
  const TOP = new Set([1, 6, 10]);
  const chips = ['01 PHOTOS', '02 BIO', '03 VISIBILITY'];
  const three = at('three') - o;
  return (
    <AbsoluteFill style={{ background: C.bg, ...useEnter('up'), ...useExit(dur, 'zoom') }}>
      <Glow x="50%" y="40%" o={0.35} />
      <div style={{ position: 'absolute', left: 72, top: 236 }}>
        <Tag text="LIVE ANALYSIS" color={C.violetLight} bg="rgba(124,58,237,0.18)" />
        <div style={{ marginTop: 18, fontFamily: INTER, fontWeight: 900, fontSize: 112, letterSpacing: -3, color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          {count.toLocaleString('en-US')}
          {count >= 1000000 ? '+' : ''}
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: C.muted }}>DATING PROFILES ANALYZED</div>
      </div>
      <div style={{ position: 'absolute', left: 72, top: 560, width: 936, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const isTop = TOP.has(i);
          const appear = fadeIn(f, 2 + i * 1.5, 6);
          return (
            <div key={i} style={{ position: 'relative', height: 196, borderRadius: 20, overflow: 'hidden', opacity: appear * (topOn > 0 && !isTop ? 1 - topOn * 0.65 : 1), border: isTop ? `${3 * topOn}px solid ${C.violet}` : '1px solid rgba(255,255,255,0.08)', transform: `scale(${isTop ? 1 + topOn * 0.06 : 1})` }}>
              <Img src={staticFile(TILE_IMGS[i % TILE_IMGS.length])} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${isTop ? 6 * (1 - topOn) + 2 : 8}px) saturate(0.7)` }} />
              {isTop && topOn > 0.3 && <Tag text="TOP" color={C.white} bg={C.violet} style={{ position: 'absolute', left: 10, top: 10, fontSize: 20, padding: '6px 14px' }} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 72, top: 1222, display: 'flex', gap: 12 }}>
        {chips.map((c, i) => {
          const s = pop(f, three + i * 4, fps);
          return (
            <div key={c} style={{ transform: `scale(${s})`, opacity: Math.min(1, s), padding: '16px 20px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.violet}`, fontFamily: INTER, fontWeight: 800, fontSize: 28, color: C.white }}>
              <span style={{ color: C.violetLight }}>✓</span> {c}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Transformation: same card, fixed step by step ----------
const Transform: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.transStart;
  const dur = S.happyStart - o;
  const photo = interpolate(f, [at('better') - o, at('better') - o + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const bio = fadeIn(f, at('magnetic') - o, 4);
  const vis = interpolate(f, [at('right') - o, at('right') - o + 16], [0.12, 1], { ...clamp, easing: ease });
  const timer = pop(f, at('thirty') - o, fps);
  const steps = [
    { t: 'Photo setup', on: photo > 0.5 },
    { t: 'Magnetic bio', on: bio > 0.5 },
    { t: 'Visibility settings', on: vis > 0.9 },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg, ...useEnter('zoom'), ...useExit(dur, 'zoom') }}>
      <Glow x="30%" y="35%" o={0.4} />
      <div style={{ position: 'absolute', left: 236, top: 226, transform: 'scale(0.8)', transformOrigin: 'left top' }}>
        <Tag text={photo > 0.5 ? 'AFTER' : 'BEFORE'} color={C.white} bg={photo > 0.5 ? C.violet : 'rgba(0,0,0,0.6)'} style={{ position: 'absolute', left: 24, top: 24, zIndex: 2 }} />
        <ProfileCard after={photo} bioAfter={bio} />
      </div>
      <div style={{ position: 'absolute', left: 72, top: 975, width: 936, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((s, i) => (
          <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderRadius: 18, background: s.on ? 'rgba(124,58,237,0.22)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${s.on ? C.violet : 'rgba(255,255,255,0.1)'}`, fontFamily: INTER, fontWeight: 700, fontSize: 28, color: s.on ? C.white : C.muted }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: s.on ? C.violet : 'transparent', border: `2px solid ${s.on ? C.violet : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 22 }}>
              {s.on ? '✓' : i + 1}
            </div>
            {s.t}
          </div>
        ))}
        <div style={{ marginTop: 10, fontFamily: INTER, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: C.violetLight }}>VISIBILITY</div>
        <div style={{ height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${vis * 100}%`, background: `linear-gradient(90deg, ${C.violet}, ${C.violetLight})` }} />
        </div>
        <div style={{ position: 'absolute', left: 620, top: -720, transform: `scale(${timer}) rotate(-4deg)`, transformOrigin: 'center', display: 'inline-flex', boxShadow: '0 16px 40px rgba(0,0,0,0.45)', padding: '16px 26px', borderRadius: 999, background: C.white, fontFamily: INTER, fontWeight: 900, fontSize: 40, color: '#14101f' }}>
          ⏱ 30 MIN
        </div>
      </div>
      <Note text="Illustration of the method. Results vary." top={1345} />
    </AbsoluteFill>
  );
};

// ---------- 5. Payoff: same guy, matches coming in ----------
const MatchBubble: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start) return null;
  const s = spring({ frame: f - start, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 500, height: 74, padding: '0 20px', borderRadius: 22, background: 'rgba(255,255,255,0.94)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', transform: `translateX(${(1 - s) * -560}px)`, fontFamily: INTER }}>
      <div style={{ width: 46, height: 46, borderRadius: 23, background: `linear-gradient(135deg, ${C.violet}, #ec4899)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Heart size={26} color="#fff" filled />
      </div>
      <div style={{ fontWeight: 800, fontSize: 30, color: '#14101f' }}>New match!</div>
      <div style={{ marginLeft: 'auto', fontWeight: 500, fontSize: 22, color: 'rgba(20,16,31,0.5)' }}>now</div>
    </div>
  );
};
const BUBBLES = () => [at('matches', 2), at('started'), at('coming'), at('in', 2) + 4];
const Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const o = S.happyStart;
  const dur = S.testiStart - o;
  const flash = interpolate(f, [0, 2, 8], [0.8, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'up') }}>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, dur], [1.04, 1.1])})` }}>
        <OffthreadVideo src={staticFile('happy.mp4')} muted style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
      </AbsoluteFill>
      <Shade />
      <div style={{ position: 'absolute', left: 72, top: 1010, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BUBBLES().map((b) => (
          <MatchBubble key={b} start={b - o} />
        ))}
      </div>
      <Note text="Dramatization" top={236} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,${flash}), rgba(124,58,237,${flash * 0.8}))` }} />
    </AbsoluteFill>
  );
};

// ---------- 6. Social proof: customer message ----------
const Testimonial: React.FC = () => {
  const f = useCurrentFrame();
  const o = S.testiStart;
  const dur = S.offerStart - o;
  const enter = useEnter('up');
  const hl = at('10X') - o;
  // Phone viewport 700 wide; screenshot 849x1853 scaled to 700 wide (×0.8245).
  const scroll = interpolate(f, [hl + 10, dur - 4], [0, -560], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoom = interpolate(f, [hl - 4, hl + 6], [1, 1.06], { ...clamp, easing: ease });
  const mark = interpolate(f, [hl, hl + 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, ...useExit(dur, 'zoom') }}>
      <Glow x="50%" y="45%" o={0.4} />
      <div style={{ position: 'absolute', left: 72, top: 236 }}>
        <Tag text="CUSTOMER MESSAGE" color={C.violetLight} bg="rgba(124,58,237,0.18)" />
      </div>
      <div style={{ position: 'absolute', left: 140, top: 320, width: 800, height: 1010, borderRadius: 56, overflow: 'hidden', border: '10px solid #1f1a2e', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', background: '#f4f1ea', ...enter }}>
        <div style={{ transform: `translateY(${scroll - 120}px) scale(${zoom})`, transformOrigin: '50% 25%' }}>
          <Img src={staticFile('testimonial.jpg')} style={{ width: 800, display: 'block' }} />
          {/* highlight over "I'm getting almost 10X more matches" (screenshot y≈292–330 → ×0.8245) */}
          <div style={{ position: 'absolute', left: 55, top: 270, height: 46, width: 540 * mark, background: 'rgba(124,58,237,0.28)', borderRadius: 8, mixBlendMode: 'multiply' }} />
        </div>
      </div>
      <Note text="Individual result. Results vary." top={1345} left={140} />
    </AbsoluteFill>
  );
};

// ---------- 7. Offer + CTA ----------
const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = S.offerStart;
  const coverS = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 12 });
  const float = Math.sin(f / 14) * 8;
  const chip1 = pop(f, at('Twenty') - o, fps);
  const chip2 = pop(f, at('fifty') - o, fps);
  const price = pop(f, at('Just') - o, fps);
  const strike = interpolate(f, [at('Just') - o + 4, at('Just') - o + 10], [0, 1], clamp);
  const guar = pop(f, at('seven-day') - o, fps);
  const cta = pop(f, at('Tap') - o, fps);
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, f - (at('Tap') - o)) * 0.4);
  const arrow = Math.abs(Math.sin(f / 6)) * 14;
  const chip = (s: number, n: string, t: string) => (
    <div style={{ transform: `scale(${s})`, opacity: Math.min(1, s), display: 'flex', alignItems: 'baseline', gap: 12, padding: '18px 26px', borderRadius: 20, background: C.card, border: '1.5px solid rgba(255,255,255,0.12)', fontFamily: INTER, color: C.white }}>
      <span style={{ fontWeight: 900, fontSize: 52, color: C.violetLight }}>{n}</span>
      <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: 2 }}>{t}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Glow x="50%" y="28%" o={0.55} />
      <div style={{ position: 'absolute', left: 215, top: 210 + float, width: 650, height: 650, transform: `perspective(1400px) rotateY(${(1 - coverS) * -25}deg) scale(${0.85 + coverS * 0.15})`, opacity: coverS }}>
        <Img src={staticFile('cover.jpg')} style={{ width: 650, height: 650, borderRadius: 24 }} />
      </div>
      <div style={{ position: 'absolute', left: 72, right: 72, top: 900, display: 'flex', gap: 16, justifyContent: 'center' }}>
        {chip(chip1, '20', 'PHOTO SETUPS')}
        {chip(chip2, '50', 'MAGNETIC BIOS')}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', transform: `scale(${price})`, opacity: Math.min(1, price), fontFamily: INTER }}>
        <span style={{ position: 'relative', fontWeight: 700, fontSize: 54, color: C.muted, marginRight: 24 }}>
          $49
          <span style={{ position: 'absolute', left: -4, top: '52%', height: 5, width: `${strike * 110}%`, background: C.red }} />
        </span>
        <span style={{ fontWeight: 900, fontSize: 120, letterSpacing: -3, color: C.white }}>$9.90</span>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 5, color: C.violetLight }}>ONE-TIME · INSTANT ACCESS</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1255, display: 'flex', justifyContent: 'center', transform: `scale(${guar})`, opacity: Math.min(1, guar) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999, border: `1.5px solid ${C.violetLight}`, fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.white }}>
          <span style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: 20, background: C.violet, alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24 }}>7</span>
          7-Day Money-Back Guarantee
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta * pulse})`, opacity: Math.min(1, cta) }}>
        <div style={{ padding: '30px 64px', borderRadius: 999, background: C.violet, boxShadow: '0 18px 60px rgba(124,58,237,0.6)', fontFamily: INTER, fontWeight: 900, fontSize: 46, color: C.white, letterSpacing: 1 }}>
          GET INSTANT ACCESS
        </div>
        <svg width="54" height="54" viewBox="0 0 24 24" style={{ marginTop: 6 + arrow }}>
          <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke={C.violetLight} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at: a, src, volume }) => (
  <Sequence from={Math.max(0, a)} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const AdTransformation: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={S.hookEnd}>
      <Hook />
    </Sequence>
    <Sequence from={S.hookEnd} durationInFrames={S.mechStart - S.hookEnd}>
      <Before />
    </Sequence>
    <Sequence from={S.mechStart} durationInFrames={S.transStart - S.mechStart}>
      <Mechanism />
    </Sequence>
    <Sequence from={S.transStart} durationInFrames={S.happyStart - S.transStart}>
      <Transform />
    </Sequence>
    <Sequence from={S.happyStart} durationInFrames={S.testiStart - S.happyStart}>
      <Payoff />
    </Sequence>
    <Sequence from={S.testiStart} durationInFrames={S.offerStart - S.testiStart}>
      <Testimonial />
    </Sequence>
    <Sequence from={S.offerStart}>
      <Offer />
    </Sequence>
    <Captions />

    <Audio src={staticFile('vo.wav')} />
    <Sfx at={0} src="whoosh.wav" volume={0.35} />
    <Sfx at={at('Completely')} src="pop.wav" volume={0.3} />
    <Sfx at={S.hookEnd - 4} src="whoosh.wav" volume={0.4} />
    <Sfx at={at('zero')} src="pop.wav" volume={0.35} />
    <Sfx at={S.beforeCardEnd - 4} src="whoosh.wav" volume={0.35} />
    <Sfx at={S.mechStart - 3} src="whoosh.wav" volume={0.4} />
    <Sfx at={at('top')} src="ping.wav" volume={0.22} />
    <Sfx at={S.transStart - 3} src="whoosh.wav" volume={0.4} />
    <Sfx at={at('better')} src="swish.wav" volume={0.4} />
    <Sfx at={at('magnetic')} src="swish.wav" volume={0.3} />
    <Sfx at={at('thirty')} src="pop.wav" volume={0.35} />
    <Sfx at={S.happyStart} src="impact.wav" volume={0.35} />
    {BUBBLES().map((b) => (
      <Sfx key={b} at={b} src="ping.wav" volume={0.28} />
    ))}
    <Sfx at={S.testiStart - 3} src="whoosh.wav" volume={0.4} />
    <Sfx at={S.offerStart - 3} src="whoosh.wav" volume={0.45} />
    <Sfx at={S.offerStart + 2} src="impact.wav" volume={0.45} />
    <Sfx at={at('Just')} src="impact.wav" volume={0.35} />
    <Sfx at={at('Tap')} src="pop.wav" volume={0.35} />
  </AbsoluteFill>
);
