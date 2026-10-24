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
  getInputProps,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSerif } from '@remotion/google-fonts/InstrumentSerif';
import WORDS from '../public/words.json';

const { fontFamily: INTER } = loadInter('normal', { weights: ['500', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: SERIF } = loadSerif('italic', { weights: ['400'], subsets: ['latin'] });

const C = {
  bg: '#0b0614',
  card: '#151021',
  violet: '#7c3aed',
  violetLight: '#c4b5fd',
  pink: '#ec4899',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.62)',
  red: '#f43f5e',
  green: '#22c55e',
};

const FPS = 30;
const VO_START = 5; // voice (and the lip-synced presenter) start at frame 5
export const DURATION = 1050; // 35 s
type Word = { word: string; start: number; end: number };
const W = WORDS as Word[];
const clean = (w: string) => w.replace(/["“”…]/g, '');
const bare = (w: string) => clean(w).replace(/[.,:!?]+$/, '');
const at = (word: string, n = 1) => {
  const hits = W.filter((x) => bare(x.word) === word);
  if (!hits[n - 1]) throw new Error(`word not found: ${word} #${n}`);
  return Math.round(hits[n - 1].start * FPS) + VO_START;
};

const S = {
  swipe: at('Zero') - 3,
  doubt: at('I', 1) - 3,
  old: at('Turns') - 3,
  product: at('So') - 3,
  newp: at('Same', 1) - 3,
  phone: at('And', 1) - 3,
  couple: at('Now') - 3,
  price: at('Nine') - 3,
};

const ease = Easing.out(Easing.cubic);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const pop = (f: number, start: number, fps: number) => spring({ frame: f - start, fps, config: { damping: 13, stiffness: 200 } });
const shake = (f: number, start: number, amp = 14) => {
  const t = f - start;
  if (t < 0 || t > 10) return '';
  const k = amp * (1 - t / 10);
  return `translate(${Math.sin(t * 2.7) * k}px, ${Math.cos(t * 3.1) * k}px)`;
};
const isSplit = (f: number) => (f >= S.swipe && f < S.doubt) || (f >= S.old && f < S.phone);

// ---------- Captions ----------
type Chunk = { words: Word[]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, from: Math.round(cur[0].start * FPS) + VO_START, to: 0 });
    cur = [];
  };
  for (const w of W) {
    cur.push(w);
    const len = cur.map((x) => clean(x.word)).join(' ').length;
    if (/[.,:!?"…]$/.test(w.word) || cur.length >= 3 || len > 15) flush();
  }
  flush();
  out.forEach((c, i) => (c.to = i + 1 < out.length ? Math.min(out[i + 1].from, c.from + 60) : c.from + 30));
  return out;
})();
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= S.couple) return null;
  const c = CHUNKS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const split = isSplit(frame);
  const top = split ? 905 : 1330;
  const s = interpolate(frame - c.from, [0, 4], [0.85, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `scale(${s})` }}>
      <div style={{ padding: '10px 26px', borderRadius: 18, background: split ? 'rgba(11,6,20,0.88)' : 'transparent', fontFamily: INTER, fontWeight: 900, fontSize: 70, lineHeight: 1.05, letterSpacing: -1.2, color: C.white, textTransform: 'uppercase', textAlign: 'center', maxWidth: 900, textShadow: split ? 'none' : '0 4px 24px rgba(0,0,0,0.6)' }}>
        {c.words.map((w, i) => {
          const active = frame >= Math.round(w.start * FPS) + VO_START && (i === c.words.length - 1 || frame < Math.round(c.words[i + 1].start * FPS) + VO_START);
          return (
            <span key={i} style={{ color: active ? C.violetLight : C.white }}>
              {clean(w.word)}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Shared ----------
const Heart: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.5 5c2.1 0 3.6 1.2 4.5 2.6C11.9 6.2 13.4 5 15.5 5 19 5 21 8.6 19.6 11.8 17.5 16.4 12 21 12 21z" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} />
  </svg>
);
const Tag: React.FC<{ text: string; color: string; bg: string; style?: React.CSSProperties }> = ({ text, color, bg, style }) => (
  <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 999, background: bg, color, fontFamily: INTER, fontWeight: 800, fontSize: 26, letterSpacing: 3, ...style }}>{text}</div>
);
const Glow: React.FC<{ x?: string; y?: string; o?: number }> = ({ x = '50%', y = '30%', o = 0.45 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${x} ${y}, rgba(124,58,237,${o}), rgba(11,6,20,0) 70%)` }} />
);
const Dramatization: React.FC<{ top?: number }> = ({ top = 1270 }) => (
  <div style={{ position: 'absolute', left: 60, top, padding: '8px 16px', borderRadius: 10, background: 'rgba(11,6,20,0.7)', fontFamily: INTER, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: 'rgba(255,255,255,0.85)' }}>DRAMATIZATION · AI-GENERATED CHARACTERS</div>
);
// The lip-synced presenter; `from` is the global frame where this clip appears.
const Him: React.FC<{ from: number; objectPosition?: string }> = ({ from, objectPosition = '50% 30%' }) => (
  <OffthreadVideo src={staticFile('him.mp4')} startFrom={Math.max(0, from - VO_START)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition }} />
);
const Split: React.FC<{ children: React.ReactNode; himFrom: number }> = ({ children, himFrom }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden' }}>
      <Glow y="45%" o={0.4} />
      {children}
    </div>
    <div style={{ position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden' }}>
      <Him from={himFrom} objectPosition="50% 24%" />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 957, height: 6, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})` }} />
  </AbsoluteFill>
);
const Stamp: React.FC<{ text: string; color: string; s: number; dir: -1 | 1; style?: React.CSSProperties }> = ({ text, color, s, dir, style }) => (
  <div style={{ position: 'absolute', top: 60, transform: `rotate(${dir * -14}deg) scale(${interpolate(s, [0, 1], [2, 1])})`, opacity: Math.min(1, s * 1.5), padding: '6px 22px', border: `7px solid ${color}`, borderRadius: 14, color, fontFamily: INTER, fontWeight: 900, fontSize: 76, letterSpacing: 4, background: 'rgba(0,0,0,0.25)', ...style }}>
    {text}
  </div>
);

// ---------- Profile card ----------
type P = { img: string; name: string; bio: string; label: string; enter: number; out: number; pos?: string; filter?: string };
const ProfileCard: React.FC<{ p: P; f: number; fps: number; dir: -1 | 1; stampText: string; stampColor: string; children?: React.ReactNode }> = ({ p, f, fps, dir, stampText, stampColor, children }) => {
  const enter = spring({ frame: f - p.enter, fps, config: { damping: 18, stiffness: 200 } });
  const out = interpolate(f, [p.out, p.out + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const stamp = pop(f, p.out - 6, fps);
  if (f < p.enter || out >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: 150, top: 110, width: 780, height: 780, borderRadius: 36, overflow: 'hidden', background: C.card, boxShadow: '0 30px 90px rgba(0,0,0,0.6)', transform: `translateY(${(1 - enter) * 80}px) translateX(${out * dir * 1300}px) rotate(${out * dir * 22}deg) scale(${0.92 + enter * 0.08})`, opacity: Math.min(1, enter * 1.5) }}>
      <Img src={staticFile(p.img)} style={{ position: 'absolute', width: 780, height: 600, objectFit: 'cover', objectPosition: p.pos ?? '50% 25%', filter: p.filter }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, height: 130, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.75))' }} />
      <div style={{ position: 'absolute', left: 30, top: 530, fontFamily: INTER, fontWeight: 800, fontSize: 48, color: C.white }}>{p.name}</div>
      <div style={{ position: 'absolute', left: 30, right: 30, top: 620 }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 20, letterSpacing: 4, color: C.muted }}>MY BIO</div>
        <div style={{ marginTop: 6, fontFamily: INTER, fontWeight: 500, fontSize: 30, lineHeight: 1.2, color: C.white }}>{p.bio}</div>
      </div>
      <Tag text={p.label} color={C.white} bg="rgba(0,0,0,0.6)" style={{ position: 'absolute', left: 22, top: 22 }} />
      {children}
      {f >= p.out - 6 && <Stamp text={stampText} color={stampColor} s={stamp} dir={dir} style={dir === -1 ? { right: 40 } : { left: 40 }} />}
    </div>
  );
};

// ---------- 1. HOOK: him, full screen ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = interpolate(f, [0, 5], [1.3, 1.12], { ...clamp, easing: ease });
  const pill = pop(f, 2, fps);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `${shake(f, 0, 16)} scale(${punch})`, transformOrigin: '50% 10%' }}>
        <Him from={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 85%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', transform: `scale(${pill})`, opacity: Math.min(1, pill) }}>
        <div style={{ padding: '18px 34px', borderRadius: 26, background: 'rgba(11,6,20,0.85)', border: `2px solid ${C.violet}`, fontFamily: INTER, fontWeight: 900, fontSize: 54, color: C.white, textAlign: 'center', lineHeight: 1.1 }}>
          POV: <span style={{ color: C.red }}>0 matches</span>
          <br />
          in 3 months
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. SWIPE LEFT ----------
const BAD: P[] = [
  { img: 'bad1.jpg', name: 'Rob, 34', bio: 'Not good at bios. Ask me anything.', label: 'CAR SELFIE', enter: 0, out: at('Nope', 1), pos: '50% 30%' },
  { img: 'bad2.jpg', name: 'Tom, 29', bio: 'Living my best life. 6ft btw.', label: 'MIRROR SELFIE', enter: at('Nope', 1) + 5, out: at('Nope', 2), pos: '50% 30%' },
  { img: 'bad3.jpg', name: 'Lee, 31', bio: '"Just ask."', label: 'WHICH ONE IS HE?', enter: at('Nope', 2) + 5, out: at('Nope', 3), pos: '50% 40%' },
];
const SwipeLeft: React.FC = () => {
  const f = useCurrentFrame() + S.swipe;
  const { fps } = useVideoConfig();
  return (
    <Split himFrom={S.swipe}>
      {BAD.map((p) => (
        <ProfileCard key={p.img} p={{ ...p, enter: Math.max(S.swipe, p.enter) }} f={f} fps={fps} dir={-1} stampText="NOPE" stampColor={C.red} />
      ))}
    </Split>
  );
};

// ---------- 3. DOUBT: him full screen + "was it me?" chips ----------
const Doubt: React.FC = () => {
  const f = useCurrentFrame() + S.doubt;
  const { fps } = useVideoConfig();
  const zoom = interpolate(f, [S.doubt, S.old], [1.12, 1.22]);
  const chips = [
    { t: 'MY FACE?', a: at('face') },
    { t: 'MY JOB?', a: at('job') },
    { t: 'MY LUCK?', a: at('luck') },
  ];
  const zero = pop(f, S.doubt + 2, fps);
  const blink = 0.55 + 0.45 * Math.abs(Math.sin((f - S.doubt) / 5));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 30%' }}>
        <Him from={S.doubt} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 85%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center', transform: `scale(${zero})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px', borderRadius: 999, background: 'rgba(11,6,20,0.85)', fontFamily: INTER, fontWeight: 900, fontSize: 40, color: C.white }}>
          <Heart size={40} color={C.red} />
          <span style={{ opacity: blink }}>0 matches</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {chips.map((c) => {
          const s = pop(f, c.a, fps);
          return f >= c.a ? (
            <div key={c.t} style={{ transform: `scale(${s}) rotate(${c.t === 'MY JOB?' ? 3 : -3}deg)`, padding: '12px 22px', borderRadius: 16, background: 'rgba(11,6,20,0.9)', border: `2px solid ${C.red}`, fontFamily: INTER, fontWeight: 900, fontSize: 34, color: C.white }}>
              <span style={{ color: C.red }}>✗</span> {c.t}
            </div>
          ) : null;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. OLD PROFILE: the real problem ----------
const OldProfile: React.FC = () => {
  const f = useCurrentFrame() + S.old;
  const { fps } = useVideoConfig();
  const p: P = { img: 'marcus.jpg', name: 'Marcus, 29', bio: 'Hey. Just ask 🤷‍♂️', label: 'MY OLD PROFILE', enter: S.old, out: S.product + 99, pos: '50% 40%', filter: 'brightness(0.55) saturate(0.35) contrast(0.85) blur(2px)' };
  const t3 = at('three');
  const timer = pop(f, t3 - 2, fps);
  const secs = interpolate(f, [t3, t3 + 30], [3, 0], clamp);
  const photo = pop(f, at('Wrong'), fps);
  const bio = pop(f, at('bio'), fps);
  return (
    <Split himFrom={S.old}>
      <ProfileCard p={p} f={f} fps={fps} dir={-1} stampText="" stampColor={C.red}>
        {f >= at('Wrong') && (
          <div style={{ position: 'absolute', left: 30, top: 130, width: 720, height: 360, border: `6px solid ${C.red}`, borderRadius: 24, transform: `scale(${photo})`, opacity: Math.min(1, photo) }}>
            <Tag text="✗ DARK, BLURRY PHOTO" color={C.white} bg={C.red} style={{ position: 'absolute', right: 16, bottom: 16 }} />
          </div>
        )}
        {f >= at('bio') && (
          <div style={{ position: 'absolute', left: 20, top: 608, width: 740, height: 120, border: `6px solid ${C.red}`, borderRadius: 20, transform: `scale(${bio})`, opacity: Math.min(1, bio) }}>
            <Tag text="✗ SAYS NOTHING" color={C.white} bg={C.red} style={{ position: 'absolute', right: 12, top: -26 }} />
          </div>
        )}
      </ProfileCard>
      {f >= t3 - 2 && (
        <div style={{ position: 'absolute', right: 60, top: 40, transform: `scale(${timer})`, padding: '12px 26px', borderRadius: 999, background: 'rgba(11,6,20,0.9)', border: `2px solid ${C.violet}`, fontFamily: INTER, fontWeight: 900, fontSize: 52, color: secs < 1 ? C.red : C.white, fontVariantNumeric: 'tabular-nums' }}>
          ⏱ {secs.toFixed(1)}s
        </div>
      )}
    </Split>
  );
};

// ---------- 5. PRODUCT: covers ----------
const Product: React.FC = () => {
  const f = useCurrentFrame() + S.product;
  const { fps } = useVideoConfig();
  const covers = [
    { img: 'cover-main.jpg', a: at('The') - 2 },
    { img: 'cover-setups.jpg', a: at('Twenty') - 2 },
    { img: 'cover-bios.jpg', a: at('Fifty') - 2 },
  ];
  const copied = pop(f, at('copied'), fps);
  return (
    <Split himFrom={S.product}>
      {covers.map((c, i) => {
        const next = covers[i + 1]?.a ?? 99999;
        if (f < c.a || f >= next + 8) return null;
        const inS = spring({ frame: f - c.a, fps, config: { damping: 16, stiffness: 160 } });
        const outS = interpolate(f, [next, next + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
        return (
          <div key={c.img} style={{ position: 'absolute', left: 190, top: 90, width: 700, height: 700, transform: `perspective(1400px) rotateY(${(1 - inS) * -35 + outS * 35}deg) translateX(${outS * -900}px) scale(${0.75 + inS * 0.25})`, opacity: Math.min(1, inS * 1.5) }}>
            <Img src={staticFile(c.img)} style={{ width: 700, height: 700, borderRadius: 26, boxShadow: '0 30px 100px rgba(124,58,237,0.6)' }} />
          </div>
        );
      })}
      {f >= at('copied') && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', transform: `scale(${copied}) rotate(-3deg)` }}>
          <div style={{ padding: '18px 30px', borderRadius: 20, background: C.white, color: C.bg, fontFamily: INTER, fontWeight: 800, fontSize: 34, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <span style={{ color: C.violet }}>✓ COPIED</span> · Bio #17
          </div>
        </div>
      )}
    </Split>
  );
};

// ---------- 6. NEW PROFILE → the good one → match ----------
const NewProfile: React.FC = () => {
  const f = useCurrentFrame() + S.newp;
  const { fps } = useVideoConfig();
  const then = at('Then') - 2;
  const mine: P = { img: 'marcus.jpg', name: 'Marcus, 29', bio: 'South London born. Terrible at darts, unbeatable at Sunday roasts. Pick the pub?', label: 'MY NEW PROFILE ✨', enter: S.newp, out: then, pos: '50% 38%', filter: 'saturate(1.1) contrast(1.05)' };
  const good: P = { img: 'good.jpg', name: 'Daniel, 30', bio: 'Rooftop bars > clubs. Will cook you my nan’s curry if you earn it.', label: 'THEN… HIM', enter: then + 2, out: at('him') + 6, pos: '50% 30%' };
  const glow = pop(f, S.newp + 4, fps);
  const match = at("It's") - 2;
  const m = spring({ frame: f - match, fps, config: { damping: 10, stiffness: 220 } });
  return (
    <Split himFrom={S.newp}>
      {f < then + 8 && (
        <div style={{ position: 'absolute', inset: 0, opacity: f >= then ? interpolate(f, [then, then + 8], [1, 0]) : 1 }}>
          <ProfileCard p={{ ...mine, out: 99999 }} f={f} fps={fps} dir={1} stampText="" stampColor={C.green}>
            <div style={{ position: 'absolute', left: 470, top: 150, transform: `scale(${pop(f, at('face') , fps)})` }}>
              <Tag text="✓ SAME FACE" color={C.white} bg={C.violet} />
            </div>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 36, boxShadow: `inset 0 0 0 ${glow * 6}px ${C.violetLight}` }} />
          </ProfileCard>
        </div>
      )}
      <ProfileCard p={good} f={f} fps={fps} dir={1} stampText="LIKE" stampColor={C.green} />
      {f >= match && (
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `rgba(11,6,20,${Math.min(0.78, m)})` }}>
          <div style={{ display: 'flex', gap: 30, marginBottom: 30, transform: `scale(${m})` }}>
            {['marcus.jpg', 'good.jpg'].map((img) => (
              <Img key={img} src={staticFile(img)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: 'cover', objectPosition: img === 'good.jpg' ? '50% 25%' : '50% 35%', border: `6px solid ${C.white}` }} />
            ))}
          </div>
          <div style={{ transform: `scale(${interpolate(m, [0, 1], [2.6, 1])}) rotate(-5deg)`, opacity: Math.min(1, m * 2), textAlign: 'center' }}>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontStyle: 'italic', fontSize: 46, letterSpacing: 4, color: C.white }}>IT'S A</div>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontStyle: 'italic', fontSize: 180, lineHeight: 0.9, letterSpacing: -5, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})`, WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 10px 40px rgba(236,72,153,0.55))' }}>MATCH!</div>
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const p2 = interpolate(f - match, [i * 2, i * 2 + 24], [0, 1], clamp);
            return p2 > 0 && p2 < 1 ? (
              <div key={i} style={{ position: 'absolute', left: 140 + i * 150, top: 800 - p2 * 520, opacity: 1 - p2, transform: `scale(${0.6 + p2})` }}>
                <Heart size={56} color={i % 2 ? C.pink : C.violetLight} filled />
              </div>
            ) : null;
          })}
        </AbsoluteFill>
      )}
    </Split>
  );
};

// ---------- 7. PHONE: notification flood ----------
const NOTIFS = [
  { t: 'New match! 💜', s: 'Daniel liked you back' },
  { t: 'New message', s: 'Daniel: “Okay… which pub?” 😂' },
  { t: 'New match! 💜', s: 'You have a new match' },
  { t: 'New message', s: 'Jay: “That bio got me 😭”' },
  { t: 'New match! 💜', s: 'You have 3 new matches' },
  { t: 'New message', s: 'Sam: “Sunday roast debate. Go.”' },
  { t: 'New match! 💜', s: 'You have a new match' },
];
const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S.couple - S.phone;
  const count = Math.round(interpolate(f, [4, dur - 4], [0, 37], clamp));
  const inS = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 8 });
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: inS }}>
      <AbsoluteFill style={{ background: `radial-gradient(1100px 1400px at 50% 20%, rgba(124,58,237,0.6), ${C.bg} 70%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: INTER, color: C.white }}>
        <div style={{ fontWeight: 600, fontSize: 34, opacity: 0.8 }}>Saturday, 21:14</div>
        <div style={{ fontWeight: 800, fontSize: 150, letterSpacing: -4, lineHeight: 1 }}>21:14</div>
      </div>
      {NOTIFS.map((n, i) => {
        const s = spring({ frame: f - 3 - i * 4, fps, config: { damping: 14, stiffness: 220 } });
        if (f < 3 + i * 4) return null;
        const y = 520 + (NOTIFS.length - 1 - i) * 0 + i * 118;
        return (
          <div key={i} style={{ position: 'absolute', left: 60, right: 60, top: Math.min(y, 1340), transform: `translateY(${(1 - s) * -60}px) scale(${0.9 + s * 0.1})`, opacity: Math.min(1, s * 1.4), display: 'flex', alignItems: 'center', gap: 22, padding: '20px 26px', borderRadius: 30, background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(20px)', fontFamily: INTER, color: C.white }}>
            <div style={{ width: 66, height: 66, borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={38} color={C.white} filled />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 30 }}>{n.t}</div>
              <div style={{ fontWeight: 500, fontSize: 27, opacity: 0.85 }}>{n.s}</div>
            </div>
            <div style={{ fontWeight: 500, fontSize: 22, opacity: 0.6 }}>now</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', right: 70, top: 440, padding: '8px 22px', borderRadius: 999, background: C.red, fontFamily: INTER, fontWeight: 900, fontSize: 40, color: C.white, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
    </AbsoluteFill>
  );
};

// ---------- 8. COUPLE reveal ----------
const Couple: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S.price - S.couple;
  const flash = interpolate(f, [0, 6], [1, 0], clamp);
  const z = interpolate(f, [0, dur], [1.14, 1.0]);
  const line = pop(f, at('official') - S.couple - 4, fps);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <Img src={staticFile('couple.jpg')} style={{ width: 1080, height: 1920, objectFit: 'cover', objectPosition: '50% 40%' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,6,20,0.5) 0%, rgba(11,6,20,0) 22%, rgba(11,6,20,0) 52%, rgba(11,6,20,0.85) 78%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${line})` }}>
        <Heart size={64} color={C.pink} filled />
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 92, color: C.white }}>Now we’re official.</div>
      </div>
      <Dramatization top={250} />
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
    </AbsoluteFill>
  );
};

// ---------- 9. PRICE + CTA ----------
const Price: React.FC = () => {
  const f = useCurrentFrame() + S.price;
  const { fps } = useVideoConfig();
  const inS = spring({ frame: f - S.price, fps, config: { damping: 200 }, durationInFrames: 8 });
  const price = pop(f, at('Nine') + 2, fps);
  const strike = interpolate(f, [at('forty-nine'), at('forty-nine') + 8], [0, 1], clamp);
  const guar = pop(f, at('Seven-day'), fps);
  const cta = pop(f, at('Tap'), fps);
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - at('Tap')) * 0.4);
  const arrow = Math.abs(Math.sin(f / 6)) * 14;
  const float = Math.sin(f / 14) * 8;
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: inS }}>
      <Glow y="28%" o={0.55} />
      <div style={{ position: 'absolute', left: 240, top: 200 + float, width: 600, height: 600 }}>
        <Img src={staticFile('cover-main.jpg')} style={{ width: 600, height: 600, borderRadius: 24, boxShadow: '0 30px 100px rgba(124,58,237,0.6)' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', transform: `scale(${price})`, opacity: Math.min(1, price), fontFamily: INTER }}>
        <span style={{ position: 'relative', fontWeight: 700, fontSize: 58, color: C.muted, marginRight: 24 }}>
          $49
          <span style={{ position: 'absolute', left: -4, top: '52%', height: 5, width: `${strike * 110}%`, background: C.red }} />
        </span>
        <span style={{ fontWeight: 900, fontSize: 140, letterSpacing: -4, color: C.white }}>$9.90</span>
        <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: 5, color: C.violetLight }}>ONE-TIME · INSTANT ACCESS</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', transform: `scale(${guar})`, opacity: Math.min(1, guar) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999, border: `1.5px solid ${C.violetLight}`, fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.white }}>
          <span style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: 20, background: C.violet, alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24 }}>7</span>
          7-Day Money-Back Guarantee
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta * pulse})`, opacity: Math.min(1, cta) }}>
        <div style={{ padding: '32px 64px', borderRadius: 999, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})`, boxShadow: '0 18px 70px rgba(236,72,153,0.5)', fontFamily: INTER, fontWeight: 900, fontSize: 48, color: C.white }}>
          FIX MY PROFILE NOW
        </div>
        <svg width="58" height="58" viewBox="0 0 24 24" style={{ marginTop: 8 + arrow }}>
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
const NO_MUSIC = Boolean((getInputProps() as { noMusic?: boolean }).noMusic);
const Music: React.FC = () => {
  const f = useCurrentFrame();
  if (NO_MUSIC) return null;
  const match = at("It's");
  const v = interpolate(f, [0, 4, match - 2, match + 4, S.couple, S.price, DURATION - 30, DURATION], [0.0, 0.15, 0.15, 0.2, 0.22, 0.17, 0.18, 0], clamp);
  return <Audio src={staticFile('music.wav')} volume={() => v} />;
};

export const Ad: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={S.swipe}>
      <Hook />
    </Sequence>
    <Sequence from={S.swipe} durationInFrames={S.doubt - S.swipe}>
      <SwipeLeft />
    </Sequence>
    <Sequence from={S.doubt} durationInFrames={S.old - S.doubt}>
      <Doubt />
    </Sequence>
    <Sequence from={S.old} durationInFrames={S.product - S.old}>
      <OldProfile />
    </Sequence>
    <Sequence from={S.product} durationInFrames={S.newp - S.product}>
      <Product />
    </Sequence>
    <Sequence from={S.newp} durationInFrames={S.phone - S.newp}>
      <NewProfile />
    </Sequence>
    <Sequence from={S.phone} durationInFrames={S.couple - S.phone}>
      <Phone />
    </Sequence>
    <Sequence from={S.couple} durationInFrames={S.price - S.couple}>
      <Couple />
    </Sequence>
    <Sequence from={S.price}>
      <Price />
    </Sequence>
    <Captions />

    <Music />
    <Sequence from={VO_START} layout="none">
      <Audio src={staticFile('vo.wav')} />
    </Sequence>
    <Sfx at={0} src="scratch.mp3" volume={0.35} />
    <Sfx at={0} src="subdrop.mp3" volume={0.45} />
    <Sfx at={S.swipe - 3} src="whoosh.mp3" volume={0.35} />
    {[1, 2, 3].map((n) => (
      <React.Fragment key={n}>
        <Sfx at={at('Nope', n) - 2} src="swipe.mp3" volume={0.45} />
        <Sfx at={at('Nope', n)} src="nope.mp3" volume={0.22} />
      </React.Fragment>
    ))}
    <Sfx at={S.doubt} src="boom_low.mp3" volume={0.3} />
    {['face', 'job', 'luck'].map((w) => (
      <Sfx key={w} at={at(w)} src="nope.mp3" volume={0.15} />
    ))}
    <Sfx at={S.old} src="swish.mp3" volume={0.4} />
    <Sfx at={at('three') - 2} src="hit_sub.mp3" volume={0.3} />
    <Sfx at={at('Wrong')} src="nope.mp3" volume={0.2} />
    <Sfx at={at('bio')} src="nope.mp3" volume={0.2} />
    <Sfx at={S.product} src="whoosh.mp3" volume={0.35} />
    <Sfx at={at('The') - 2} src="unlock.mp3" volume={0.3} />
    {['Twenty', 'Fifty'].map((w) => (
      <Sfx key={w} at={at(w) - 2} src="swish.mp3" volume={0.3} />
    ))}
    <Sfx at={at('copied')} src="notif.mp3" volume={0.22} />
    <Sfx at={S.newp} src="sparkle.mp3" volume={0.3} />
    <Sfx at={at('Then') - 2} src="swish.mp3" volume={0.35} />
    <Sfx at={at('him') + 4} src="swipe.mp3" volume={0.45} />
    <Sfx at={at("It's") - 2} src="sparkle.mp3" volume={0.4} />
    <Sfx at={S.phone} src="whoosh.mp3" volume={0.3} />
    {NOTIFS.map((_, i) => (
      <Sfx key={i} at={S.phone + 3 + i * 4} src="notif.mp3" volume={0.18} />
    ))}
    <Sfx at={S.couple} src="sparkle.mp3" volume={0.4} />
    <Sfx at={S.couple} src="boom_low.mp3" volume={0.3} />
    <Sfx at={S.price} src="hit_sub.mp3" volume={0.3} />
    <Sfx at={at('forty-nine') + 4} src="chaching.mp3" volume={0.3} />
    <Sfx at={at('Tap')} src="notif.mp3" volume={0.25} />
  </AbsoluteFill>
);
