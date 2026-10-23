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
const VO_START = 5; // voice (and the lip-synced avatar) start at frame 5
type Word = { word: string; start: number; end: number };
const W = WORDS as Word[];
const clean = (w: string) => w.replace(/["“”…]/g, '');
const bare = (w: string) => clean(w).replace(/[.,:!?]$/, '');
const at = (word: string, n = 1) => {
  const hits = W.filter((x) => bare(x.word) === word);
  if (!hits[n - 1]) throw new Error(`word not found: ${word} #${n}`);
  return Math.round(hits[n - 1].start * FPS) + VO_START;
};

const S = {
  hookEnd: at('Car') - 2,
  turnStart: at('But') - 2,
  proofStart: at('And', 2) - 1,
  offerStart: at("It's", 1) - 2,
  priceStart: at('Just', 2) - 2,
  end: 900,
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

// ---------- Captions (position depends on the layout of the moment) ----------
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
  if (frame >= S.priceStart) return null;
  const c = CHUNKS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const split = (frame >= S.hookEnd && frame < S.proofStart) || frame >= S.offerStart;
  const top = split ? 905 : 1330;
  const s = interpolate(frame - c.from, [0, 4], [0.85, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', transform: `scale(${s})` }}>
      <div style={{ padding: '10px 26px', borderRadius: 18, background: split ? 'rgba(11,6,20,0.88)' : 'transparent', fontFamily: INTER, fontWeight: 900, fontSize: 70, lineHeight: 1.05, letterSpacing: -1.2, color: C.white, textTransform: 'uppercase', textAlign: 'center', maxWidth: 900, textShadow: split ? 'none' : '0 4px 24px rgba(0,0,0,0.55)' }}>
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
// The lip-synced presenter; `from` is the global frame where this clip appears.
const Her: React.FC<{ from: number; style?: React.CSSProperties; objectPosition?: string }> = ({ from, style, objectPosition = '50% 30%' }) => (
  <OffthreadVideo src={staticFile('her.mp4')} startFrom={Math.max(0, from - VO_START)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition, ...style }} />
);

// ---------- 1. HOOK: her, full screen ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const two = at('two');
  const secs = interpolate(f, [two, two + 40], [2.0, 0.0], clamp);
  const timer = pop(f, two - 2, fps);
  const punch = interpolate(f, [0, 5], [1.42, 1.26], { ...clamp, easing: ease });
  const face = at('face');
  const zoom2 = interpolate(f, [face, face + 4], [0, 0.08], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `${shake(f, 0, 16)} scale(${punch + zoom2})`, transformOrigin: '50% 8%' }}>
        <Her from={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 85%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center', transform: `scale(${timer})`, opacity: Math.min(1, timer) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 999, background: 'rgba(11,6,20,0.85)', border: `2px solid ${C.violet}`, fontFamily: INTER, fontWeight: 900, fontSize: 64, color: C.white, fontVariantNumeric: 'tabular-nums' }}>
          ⏱ {secs.toFixed(1)}s
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. SWIPE LEFT: split reaction ----------
type P = { img: string; name: string; bio: string; label: string; enter: number; out: number; pos?: string; bioFocus?: boolean };
const ProfileCard: React.FC<{ p: P; f: number; fps: number; dir: -1 | 1; stampText: string; stampColor: string }> = ({ p, f, fps, dir, stampText, stampColor }) => {
  const enter = spring({ frame: f - p.enter, fps, config: { damping: 18, stiffness: 200 } });
  const out = interpolate(f, [p.out, p.out + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const stamp = pop(f, p.out - 6, fps);
  if (f < p.enter || out >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: 150, top: 120, width: 780, height: 760, borderRadius: 36, overflow: 'hidden', background: C.card, boxShadow: '0 30px 90px rgba(0,0,0,0.6)', transform: `translateY(${(1 - enter) * 80}px) translateX(${out * dir * 1300}px) rotate(${out * dir * 22}deg) scale(${0.92 + enter * 0.08})`, opacity: Math.min(1, enter * 1.5) }}>
      <Img src={staticFile(p.img)} style={{ position: 'absolute', width: 780, height: p.bioFocus ? 430 : 600, objectFit: 'cover', objectPosition: p.pos ?? '50% 25%' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: p.bioFocus ? 300 : 470, height: 130, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.75))' }} />
      <div style={{ position: 'absolute', left: 30, top: p.bioFocus ? 360 : 530, fontFamily: INTER, fontWeight: 800, fontSize: 48, color: C.white }}>{p.name}</div>
      <div style={{ position: 'absolute', left: 30, right: 30, top: p.bioFocus ? 450 : 620 }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 20, letterSpacing: 4, color: C.muted }}>MY BIO</div>
        <div style={{ marginTop: 6, fontFamily: INTER, fontWeight: p.bioFocus ? 800 : 500, fontSize: p.bioFocus ? 64 : 28, lineHeight: 1.2, color: C.white }}>{p.bio}</div>
      </div>
      <Tag text={p.label} color={C.white} bg="rgba(0,0,0,0.6)" style={{ position: 'absolute', left: 22, top: 22 }} />
      {f >= p.out - 6 && (
        <div style={{ position: 'absolute', right: dir === -1 ? 40 : undefined, left: dir === 1 ? 40 : undefined, top: 60, transform: `rotate(${dir * -14}deg) scale(${interpolate(stamp, [0, 1], [2, 1])})`, opacity: Math.min(1, stamp * 1.5), padding: '6px 22px', border: `7px solid ${stampColor}`, borderRadius: 14, color: stampColor, fontFamily: INTER, fontWeight: 900, fontSize: 76, letterSpacing: 4 }}>
          {stampText}
        </div>
      )}
    </div>
  );
};
const Split: React.FC<{ children: React.ReactNode; herFrom: number }> = ({ children, herFrom }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden' }}>
      <Glow y="45%" o={0.4} />
      {children}
    </div>
    <div style={{ position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden' }}>
      <Her from={herFrom} objectPosition="50% 22%" />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 957, height: 6, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})` }} />
  </AbsoluteFill>
);
const PROFILES: P[] = [
  { img: 'before.jpg', name: 'Ryan, 31', bio: 'Not good at bios. Love travel, food and good vibes.', label: 'CAR SELFIE', enter: 0, out: at('Left', 1), pos: '50% 30%' },
  { img: 'bad2.jpg', name: 'Mike, 30', bio: 'Living my best life. Ask me anything.', label: 'SUNGLASSES', enter: at('Left', 1) + 6, out: at('Left', 2), pos: '50% 25%' },
  { img: 'bad3.jpg', name: 'Josh, 29', bio: '"Just ask."', label: 'THE BIO', enter: at('Left', 2) + 6, out: at('Left', 3), pos: '50% 20%', bioFocus: true },
];
const SwipeLeft: React.FC = () => {
  const f = useCurrentFrame() + S.hookEnd; // global frame
  const { fps } = useVideoConfig();
  return (
    <Split herFrom={S.hookEnd}>
      {PROFILES.map((p) => (
        <ProfileCard key={p.img} p={{ ...p, enter: Math.max(S.hookEnd, p.enter) }} f={f} fps={fps} dir={-1} stampText="NOPE" stampColor={C.red} />
      ))}
    </Split>
  );
};

// ---------- 3. TURN: the good profile, swipe right, match ----------
const Turn: React.FC = () => {
  const f = useCurrentFrame() + S.turnStart;
  const { fps } = useVideoConfig();
  const p: P = { img: 'after.jpg', name: 'Ryan, 31', bio: 'Terrible at karaoke. Great at finding the best ramen in any city. Your go-to order?', label: 'THE FIX', enter: S.turnStart + 2, out: at('right'), pos: '50% 12%' };
  const light = pop(f, at('Good'), fps);
  const bio = pop(f, at('bio'), fps);
  const match = at('right') + 6;
  const m = spring({ frame: f - match, fps, config: { damping: 10, stiffness: 220 } });
  return (
    <Split herFrom={S.turnStart}>
      <ProfileCard p={p} f={f} fps={fps} dir={1} stampText="LIKE" stampColor={C.green} />
      {f < p.out && (
        <>
          <div style={{ position: 'absolute', left: 600, top: 150, transform: `scale(${light})` }}>
            <Tag text="✓ GOOD LIGHT" color={C.white} bg={C.violet} />
          </div>
          <div style={{ position: 'absolute', left: 190, top: 670, transform: `scale(${bio})` }}>
            <Tag text="✓ A BIO WORTH ANSWERING" color={C.white} bg={C.violet} />
          </div>
        </>
      )}
      {f >= match && (
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `rgba(11,6,20,${Math.min(0.75, m)})` }}>
          <div style={{ transform: `scale(${interpolate(m, [0, 1], [2.6, 1])}) rotate(-5deg)`, opacity: Math.min(1, m * 2), textAlign: 'center' }}>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontStyle: 'italic', fontSize: 46, letterSpacing: 4, color: C.white }}>IT'S A</div>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontStyle: 'italic', fontSize: 190, lineHeight: 0.9, letterSpacing: -5, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})`, WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 10px 40px rgba(236,72,153,0.55))' }}>MATCH!</div>
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const p2 = interpolate(f - match, [i * 2, i * 2 + 24], [0, 1], clamp);
            return p2 > 0 && p2 < 1 ? (
              <div key={i} style={{ position: 'absolute', left: 140 + i * 150, top: 760 - p2 * 520, opacity: 1 - p2, transform: `scale(${0.6 + p2})` }}>
                <Heart size={56} color={i % 2 ? C.pink : C.violetLight} filled />
              </div>
            ) : null;
          })}
        </AbsoluteFill>
      )}
    </Split>
  );
};

// ---------- 4. PROOF: the real couple ----------
const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S.offerStart - S.proofStart;
  const enter = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 8 });
  const z = interpolate(f, [0, dur], [1.12, 1.0]);
  const label = pop(f, 6, fps);
  const heart = pop(f, at('met') - S.proofStart, fps);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: enter }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <Img src={staticFile('couple.jpg')} style={{ width: 1080, height: 1920, objectFit: 'cover', objectPosition: '47% 40%' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,6,20,0.55) 0%, rgba(11,6,20,0) 25%, rgba(11,6,20,0) 58%, rgba(11,6,20,0.8) 80%)' }} />
      <div style={{ position: 'absolute', left: 72, top: 236, transform: `scale(${label})`, transformOrigin: 'left center' }}>
        <Tag text="REAL CUSTOMERS" color={C.white} bg={C.violet} />
        <div style={{ marginTop: 10, fontFamily: INTER, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.85)' }}>Photo shared with permission</div>
      </div>
      <div style={{ position: 'absolute', left: 72, top: 1150, transform: `scale(${heart})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Heart size={64} color={C.pink} filled />
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, color: C.white }}>They matched.</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. OFFER: product (top) + her (bottom) ----------
const Offer: React.FC = () => {
  const f = useCurrentFrame() + S.offerStart;
  const { fps } = useVideoConfig();
  const cover = spring({ frame: f - S.offerStart, fps, config: { damping: 200 }, durationInFrames: 10 });
  const chips = [
    { t: '20 PHOTO SETUPS', a: at('Twenty') },
    { t: '50 MAGNETIC BIOS', a: at('fifty') },
    { t: '1 SECRET OPTIMIZATION', a: at('one') },
  ];
  return (
    <Split herFrom={S.offerStart}>
      <div style={{ position: 'absolute', left: 250, top: 70, width: 580, height: 580, transform: `perspective(1400px) rotateY(${(1 - cover) * -25}deg) scale(${0.8 + cover * 0.2})`, opacity: cover }}>
        <Img src={staticFile('cover.jpg')} style={{ width: 580, height: 580, borderRadius: 22, boxShadow: '0 30px 90px rgba(124,58,237,0.55)' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, padding: '0 40px' }}>
        {chips.map((c) => {
          const s = pop(f, c.a, fps);
          return (
            <div key={c.t} style={{ transform: `scale(${s})`, opacity: Math.min(1, s), padding: '14px 22px', borderRadius: 16, background: C.card, border: `1.5px solid ${C.violet}`, fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.white }}>
              <span style={{ color: C.violetLight }}>✓</span> {c.t}
            </div>
          );
        })}
      </div>
    </Split>
  );
};

// ---------- 6. PRICE + CTA ----------
const Price: React.FC = () => {
  const f = useCurrentFrame() + S.priceStart;
  const { fps } = useVideoConfig();
  const inS = spring({ frame: f - S.priceStart, fps, config: { damping: 200 }, durationInFrames: 8 });
  const price = pop(f, at('Just', 2) + 2, fps);
  const strike = interpolate(f, [at('Just', 2) + 6, at('Just', 2) + 12], [0, 1], clamp);
  const cta = pop(f, at('Tap'), fps);
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - at('Tap')) * 0.4);
  const arrow = Math.abs(Math.sin(f / 6)) * 14;
  const float = Math.sin(f / 14) * 8;
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: inS }}>
      <Glow y="28%" o={0.55} />
      <div style={{ position: 'absolute', left: 240, top: 200 + float, width: 600, height: 600 }}>
        <Img src={staticFile('cover.jpg')} style={{ width: 600, height: 600, borderRadius: 24, boxShadow: '0 30px 100px rgba(124,58,237,0.6)' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', transform: `scale(${price})`, opacity: Math.min(1, price), fontFamily: INTER }}>
        <span style={{ position: 'relative', fontWeight: 700, fontSize: 58, color: C.muted, marginRight: 24 }}>
          $49
          <span style={{ position: 'absolute', left: -4, top: '52%', height: 5, width: `${strike * 110}%`, background: C.red }} />
        </span>
        <span style={{ fontWeight: 900, fontSize: 140, letterSpacing: -4, color: C.white }}>$9.90</span>
        <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: 5, color: C.violetLight }}>ONE-TIME · INSTANT ACCESS</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', opacity: Math.min(1, price) }}>
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
  const match = at('right') + 6;
  const v = interpolate(f, [0, 4, match - 2, match + 4, S.priceStart, 870, 900], [0.0, 0.17, 0.17, 0.26, 0.2, 0.22, 0], clamp);
  return <Audio src={staticFile('music.wav')} volume={() => v} />;
};

export const Ad: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={S.hookEnd}>
      <Hook />
    </Sequence>
    <Sequence from={S.hookEnd} durationInFrames={S.turnStart - S.hookEnd}>
      <SwipeLeft />
    </Sequence>
    <Sequence from={S.turnStart} durationInFrames={S.proofStart - S.turnStart}>
      <Turn />
    </Sequence>
    <Sequence from={S.proofStart} durationInFrames={S.offerStart - S.proofStart}>
      <Proof />
    </Sequence>
    <Sequence from={S.offerStart} durationInFrames={S.priceStart - S.offerStart}>
      <Offer />
    </Sequence>
    <Sequence from={S.priceStart}>
      <Price />
    </Sequence>
    <Captions />

    <Music />
    <Sequence from={VO_START} layout="none">
      <Audio src={staticFile('vo.wav')} />
    </Sequence>
    <Sfx at={0} src="scratch.mp3" volume={0.35} />
    <Sfx at={0} src="hit_sub.mp3" volume={0.35} />
    <Sfx at={at('face') + 2} src="boom_low.mp3" volume={0.3} />
    <Sfx at={S.hookEnd - 3} src="whoosh.mp3" volume={0.35} />
    {[1, 2, 3].map((n) => (
      <React.Fragment key={n}>
        <Sfx at={at('Left', n) - 2} src="swipe.mp3" volume={0.45} />
        <Sfx at={at('Left', n)} src="nope.mp3" volume={0.22} />
      </React.Fragment>
    ))}
    <Sfx at={S.turnStart} src="swish.mp3" volume={0.4} />
    <Sfx at={at('Good')} src="notif.mp3" volume={0.22} />
    <Sfx at={at('bio')} src="notif.mp3" volume={0.22} />
    <Sfx at={at('right') - 2} src="swipe.mp3" volume={0.45} />
    <Sfx at={at('right') + 6} src="sparkle.mp3" volume={0.4} />
    <Sfx at={S.proofStart} src="whoosh.mp3" volume={0.3} />
    <Sfx at={S.offerStart - 2} src="whoosh.mp3" volume={0.35} />
    <Sfx at={S.offerStart + 2} src="unlock.mp3" volume={0.3} />
    {['Twenty', 'fifty', 'one'].map((w) => (
      <Sfx key={w} at={at(w)} src="swish.mp3" volume={0.25} />
    ))}
    <Sfx at={S.priceStart} src="hit_sub.mp3" volume={0.35} />
    <Sfx at={at('Tap')} src="notif.mp3" volume={0.25} />
  </AbsoluteFill>
);
