// Peças compartilhadas pelas Variações 2 e 3 (mesmo estilo da Variação 1: branco com contorno, destaque laranja).
import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, getInputProps, useCurrentFrame } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

export const { fontFamily: INTER } = loadInter('normal', { weights: ['700', '800', '900'], subsets: ['latin', 'latin-ext'] });

export const C = { orange: '#ff8a00', yellow: '#ffd23f', red: '#ff3b3b', green: '#2fbf5b', white: '#ffffff', ink: '#1a120b', cream: '#fff6e8', wa: '#dcf8c6' };
export const FPS = 30;
export const VO = 5;
export const t = (s: number) => Math.round(s * FPS) + VO;
export type Word = { word: string; start: number; end: number };
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.out(Easing.cubic);
export const pop = (f: number, at: number, damping = 11) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness: 220 } });
export const shake = (f: number, at: number, amp = 14, len = 8) => {
  const k = f - at;
  if (k < 0 || k > len) return '';
  const a = amp * (1 - k / len);
  return `translate(${Math.sin(k * 2.7) * a}px, ${Math.cos(k * 3.1) * a}px)`;
};
export const between = (f: number, a: number, b: number) => f >= t(a) && f < t(b);
export const outline = '0 0 2px #000, 0 0 2px #000, 0 4px 14px rgba(0,0,0,0.85), 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000';

// ---------- Fundo ----------
export const Still: React.FC<{ src: string; from: number; to: number; z0?: number; z1?: number; origin?: string }> = ({ src, from, to, z0 = 1.05, z1 = 1.18, origin = '50% 50%' }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [t(from), t(to)], [z0, z1], clamp);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${z})`, transformOrigin: origin }} />
    </AbsoluteFill>
  );
};
export const Clip: React.FC<{ src: string; from: number; startFrom?: number; rate?: number; z?: number }> = ({ src, from, startFrom = 0, rate = 1, z = 1 }) => (
  <Sequence from={t(from)} layout="none">
    <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={rate} muted style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${z})` }} />
  </Sequence>
);
// Apresentadora com lip-sync: o vídeo começa junto com a narração (frame VO), então o trecho em `from` é o mesmo da fala.
export const Pres: React.FC<{ src: string; from: number; to: number; z0?: number; z1?: number; origin?: string }> = ({ src, from, to, z0 = 1, z1 = 1.06, origin = '50% 28%' }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [t(from), t(to)], [z0, z1], clamp);
  return (
    <Sequence from={t(from)} layout="none">
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <OffthreadVideo src={staticFile(src)} startFrom={t(from) - VO} muted style={{ width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${z})`, transformOrigin: origin }} />
      </AbsoluteFill>
    </Sequence>
  );
};
export const Dim: React.FC<{ o?: number }> = ({ o = 0.35 }) => <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${o + 0.15}) 0%, rgba(0,0,0,${o * 0.4}) 35%, rgba(0,0,0,${o * 0.4}) 55%, rgba(0,0,0,${o + 0.2}) 100%)` }} />;
// Escurece só a metade de baixo (cenas com rosto: o texto fica no avental, nunca no rosto).
export const DimLow: React.FC = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0.6) 100%)' }} />;
// Imagem vertical (print) emoldurada sobre o próprio fundo desfocado.
export const Framed: React.FC<{ src: string; from: number; to: number; top?: number; w?: number }> = ({ src, from, to, top = 300, w = 760 }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [t(from), t(to)], [1, 1.07], clamp);
  const s = pop(f, t(from), 13);
  return (
    <AbsoluteFill>
      <Img src={staticFile(src)} style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(30px) brightness(0.45)', transform: 'scale(1.15)' }} />
      <div style={{ position: 'absolute', left: (1080 - w) / 2 - 40, top, width: w, borderRadius: 36, overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 30px 90px rgba(0,0,0,0.7)', transform: `scale(${interpolate(s, [0, 1], [0.7, 1]) * z}) rotate(${interpolate(s, [0, 1], [-6, -1.5])}deg)` }}>
        <Img src={staticFile(src)} style={{ display: 'block', width: '100%' }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Textos ----------
export const Title: React.FC<{ at: number; until?: number; text: string; color?: string; size?: number; top?: number }> = ({ at, until, text, color = C.yellow, size = 92, top = 280 }) => {
  const f = useCurrentFrame();
  if (f < t(at) || (until !== undefined && f >= t(until))) return null;
  const s = pop(f, t(at));
  return (
    <div style={{ position: 'absolute', left: 50, right: 130, top, textAlign: 'center', transform: `scale(${interpolate(s, [0, 1], [1.8, 1])}) ${shake(f, t(at) + 2)}`, opacity: Math.min(1, s * 2) }}>
      <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -1, textTransform: 'uppercase', color, textShadow: outline }}>{text}</span>
    </div>
  );
};
export const Slam: React.FC<{ at: number; until: number; text: string; color?: string; size?: number; top?: number; flash?: boolean }> = ({ at, until, text, color = C.orange, size = 200, top = 760, flash = true }) => {
  const f = useCurrentFrame();
  if (f < t(at) || f >= t(until)) return null;
  const sc = interpolate(f - t(at), [0, 4, 7], [3, 0.94, 1], { ...clamp, easing: ease });
  const fl = flash ? interpolate(f - t(at), [0, 5], [0.45, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ transform: shake(f, t(at) + 3, 20) }}>
      <AbsoluteFill style={{ background: C.white, opacity: fl }} />
      <div style={{ position: 'absolute', left: 40, right: 140, top, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: -4, lineHeight: 1, color, textShadow: outline, transform: `scale(${sc})`, whiteSpace: 'pre-line' }}>{text}</div>
    </AbsoluteFill>
  );
};
export const Tag: React.FC<{ text: string; bg?: string; color?: string; style?: React.CSSProperties }> = ({ text, bg = C.yellow, color = C.ink, style }) => (
  <div style={{ display: 'inline-block', padding: '12px 26px', borderRadius: 999, background: bg, color, fontFamily: INTER, fontWeight: 900, fontSize: 40, letterSpacing: 1, textTransform: 'uppercase', textShadow: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.45)', whiteSpace: 'nowrap', ...style }}>{text}</div>
);
export const Ejemplo: React.FC<{ at: number; top: number; text?: string }> = ({ at, top, text = 'Ejemplo' }) => {
  const f = useCurrentFrame();
  if (f < t(at)) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 130, top, textAlign: 'center', transform: `scale(${pop(f, t(at))})` }}>
      <Tag text={text} bg="rgba(255,246,232,0.92)" style={{ fontSize: 26 }} />
    </div>
  );
};
// Contador animado (ex.: 0 → 1.333).
export const Counter: React.FC<{ from: number; to: number; value: number; prefix?: string; suffix?: string; size?: number; top: number; color?: string }> = ({ from, to, value, prefix = '', suffix = '', size = 190, top, color = C.yellow }) => {
  const f = useCurrentFrame();
  if (f < t(from)) return null;
  const v = Math.round(interpolate(f, [t(from), t(to)], [0, value], { ...clamp, easing: Easing.out(Easing.quad) }));
  const done = f >= t(to);
  return (
    <div style={{ position: 'absolute', left: 40, right: 140, top, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: -5, lineHeight: 1, color, textShadow: outline, transform: `scale(${done ? interpolate(pop(f, t(to), 9), [0, 1], [1.25, 1]) : 1}) ${shake(f, t(to), 16)}`, fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
      {suffix}
    </div>
  );
};

// Barra de comando do Asesor IA (robô da página + texto digitado + pontinhos).
export const Cmd: React.FC<{ at: number; text: string; top?: number; until?: number }> = ({ at, text, top = 250, until }) => {
  const f = useCurrentFrame();
  if (f < t(at) || (until !== undefined && f >= t(until))) return null;
  const s = pop(f, t(at), 13);
  const n = Math.floor(interpolate(f - t(at), [3, 3 + text.length * 0.8], [0, text.length], clamp));
  const dots = '.'.repeat(1 + (Math.floor(f / 6) % 3));
  return (
    <div style={{ position: 'absolute', left: 50, right: 140, top, display: 'flex', alignItems: 'center', gap: 18, padding: '16px 24px', borderRadius: 26, background: 'rgba(18,14,10,0.9)', border: `3px solid ${C.orange}`, boxShadow: '0 16px 50px rgba(0,0,0,0.55)', transform: `translateY(${(1 - s) * -60}px)`, opacity: Math.min(1, s * 1.5), fontFamily: INTER }}>
      <Img src={staticFile('asesor.png')} style={{ width: 72, height: 80, objectFit: 'contain' }} />
      <div style={{ fontWeight: 800, fontSize: 40, color: C.white, whiteSpace: 'nowrap' }}>
        <span style={{ color: C.orange }}>Asesor IA:</span> {text.slice(0, n)}
        {n >= text.length ? <span style={{ color: C.yellow }}>{dots}</span> : <span style={{ opacity: f % 10 < 5 ? 1 : 0 }}>|</span>}
      </div>
    </div>
  );
};
// Notificação estilo celular.
export const Notif: React.FC<{ at: number; icon: string; title: string; body: string; top?: number }> = ({ at, icon, title, body, top = 560 }) => {
  const f = useCurrentFrame();
  if (f < t(at)) return null;
  const n = pop(f, t(at), 14);
  return (
    <div style={{ position: 'absolute', left: 60, right: 140, top, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 26px', borderRadius: 30, background: 'rgba(255,246,232,0.96)', boxShadow: '0 18px 50px rgba(0,0,0,0.5)', transform: `translateY(${(1 - n) * -200}px)`, opacity: Math.min(1, n * 1.5), fontFamily: INTER }}>
      <div style={{ width: 76, height: 76, flex: '0 0 76px', borderRadius: 18, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 32, color: C.orange }}>{title}</div>
        <div style={{ fontWeight: 900, fontSize: 44, color: C.ink, lineHeight: 1.1 }}>{body}</div>
      </div>
    </div>
  );
};
// Balão de chat (o lado "me" é a pessoa; o outro é o Asesor IA).
export const Bubble: React.FC<{ at: number; text: string; me?: boolean; size?: number }> = ({ at, text, me = false, size = 37 }) => {
  const f = useCurrentFrame();
  if (f < t(at)) return null;
  const s = pop(f, t(at), 12);
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', transform: `scale(${s})`, transformOrigin: me ? 'right center' : 'left center' }}>
      <div style={{ maxWidth: 760, padding: '16px 24px', borderRadius: 28, borderBottomRightRadius: me ? 6 : 28, borderBottomLeftRadius: me ? 28 : 6, background: me ? C.wa : C.white, color: C.ink, fontFamily: INTER, fontWeight: 800, fontSize: size, lineHeight: 1.16, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>{text}</div>
    </div>
  );
};

// ---------- Legendas palavra por palavra (laranja na palavra ativa) ----------
type Chunk = { words: Word[]; from: number; to: number };
const chunk = (W: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, from: t(cur[0].start), to: 0 });
    cur = [];
  };
  for (const w of W) {
    cur.push(w);
    if (/[.,:!?…]$/.test(w.word) || cur.length >= 3) flush();
  }
  flush();
  out.forEach((c, i) => (c.to = i + 1 < out.length ? Math.min(out[i + 1].from, c.from + 60) : c.from + 40));
  return out;
};
export const makeCaptions = (W: Word[], hideAt: number, top = 1250): React.FC => {
  const CHUNKS = chunk(W);
  return () => {
    const f = useCurrentFrame();
    if (f >= t(hideAt)) return null; // o botão do CTA assume
    const c = CHUNKS.find((x) => f >= x.from && f < x.to);
    if (!c) return null;
    const s = interpolate(f - c.from, [0, 4], [0.8, 1], { ...clamp, easing: ease });
    return (
      <div style={{ position: 'absolute', left: 40, right: 140, top, textAlign: 'center', transform: `scale(${s})` }}>
        {c.words.map((w, i) => {
          const active = f >= t(w.start) && (i === c.words.length - 1 || f < t(c.words[i + 1].start));
          return (
            <span key={i} style={{ fontFamily: INTER, fontWeight: 900, fontSize: 82, lineHeight: 1.1, color: active ? C.orange : C.white, textShadow: outline }}>
              {w.word.replace(/[…:«»]/g, '').replace(/\.$/, '')}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    );
  };
};

// ---------- Oferta ----------
// Mockup do método com o topo fora do quadro (esconde "genera hasta US$1,500 al mes").
export const Mockup: React.FC<{ from: number }> = ({ from }) => (
  <Sequence from={t(from)} layout="none">
    <OffthreadVideo src={staticFile('v_mockup.mp4')} playbackRate={0.6} muted style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(28px) brightness(0.5)', transform: 'scale(1.15)' }} />
    <div style={{ position: 'absolute', left: 0, top: 590, width: 1080, height: 900, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
      <OffthreadVideo src={staticFile('v_mockup.mp4')} playbackRate={0.6} muted style={{ position: 'absolute', left: 0, top: -180, width: 1080, height: 1080, objectFit: 'cover' }} />
    </div>
  </Sequence>
);
export const Precio: React.FC<{ strikeAt: number; priceAt: number; tagAt?: number; tag?: string; top?: number; compact?: boolean }> = ({ strikeAt, priceAt, tagAt, tag = 'Ahorra 80% · pago único', top = 235, compact = false }) => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [t(strikeAt), t(strikeAt) + 8], [0, 1], clamp);
  const p = pop(f, t(priceAt), 9);
  const big = compact ? 120 : 140;
  return (
    <div style={{ position: 'absolute', left: 30, right: 130, top, padding: '18px 10px 22px', minHeight: compact ? 0 : 300, borderRadius: 30, background: 'rgba(12,8,4,0.92)', textAlign: 'center', fontFamily: INTER, fontWeight: 900, textShadow: outline }}>
      <span style={{ position: 'relative', fontSize: compact ? 64 : 80, color: 'rgba(255,255,255,0.8)', marginRight: 20 }}>
        US$57
        <span style={{ position: 'absolute', left: -6, top: '52%', height: 12, width: `${strike * 112}%`, background: C.red, borderRadius: 6, transform: 'rotate(-6deg)' }} />
      </span>
      {f >= t(priceAt) && <span style={{ display: 'inline-block', fontSize: big, color: C.yellow, transform: `scale(${interpolate(p, [0, 1], [1.7, 1])})` }}>US$9,90</span>}
      {f >= t(tagAt ?? priceAt) && <div><Tag text={tag} bg={C.red} color={C.white} style={{ fontSize: 34, marginTop: 6, transform: `scale(${pop(f, t(tagAt ?? priceAt))})` }} /></div>}
    </div>
  );
};
export const Cta: React.FC<{ at: number; text: string; top?: number }> = ({ at, text, top = 1250 }) => {
  const f = useCurrentFrame();
  if (f < t(at)) return null;
  const cta = pop(f, t(at), 10);
  const pulse = 1 + 0.05 * Math.sin(Math.max(0, f - t(at)) * 0.4);
  const arrow = Math.abs(Math.sin(f / 6)) * 20;
  return (
    <div style={{ position: 'absolute', left: 60, right: 140, top, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta * pulse})` }}>
      <div style={{ padding: '30px 44px', borderRadius: 999, background: C.orange, fontFamily: INTER, fontWeight: 900, fontSize: 56, color: C.white, textShadow: '0 3px 0 rgba(0,0,0,0.4)', boxShadow: '0 16px 50px rgba(255,138,0,0.6)', whiteSpace: 'nowrap' }}>{text}</div>
      <div style={{ fontSize: 80, marginTop: 4 + arrow }}>👇</div>
    </div>
  );
};

// ---------- Som ----------
export const Sfx: React.FC<{ at: number; src: string; v: number }> = ({ at, src, v }) => (
  <Sequence from={Math.max(0, t(at))} layout="none">
    <Audio src={staticFile(src)} volume={v} />
  </Sequence>
);
const NO_MUSIC = Boolean((getInputProps() as { noMusic?: boolean }).noMusic);
export const Music: React.FC<{ src: string; duration: number; v?: number }> = ({ src, duration, v = 0.17 }) => {
  const f = useCurrentFrame();
  if (NO_MUSIC) return null;
  const vol = interpolate(f, [0, 4, duration - 30, duration], [0, v, v, 0], clamp);
  return <Audio src={staticFile(src)} volume={() => vol} />;
};
