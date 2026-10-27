// Modelo de VSL 16:9 (1920x1080) usado em "Barritas Que Venden": apresentadora com lip-sync reenquadrada por cena
// (tela cheia com zoom / metade direita), painéis à esquerda, cenas por IA, legenda palavra por palavra.
// Ajuste S (tempos em segundos da narração), LAYOUT, textos e arquivos de public/. Composição: id "Vsl", 1920x1080.
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
import WORDS from '../public/words.json';

const { fontFamily: INTER } = loadInter('normal', { weights: ['600', '800', '900'], subsets: ['latin', 'latin-ext'] });

// Paleta da página Barritas Que Venden.
const C = {
  bg: '#12261a',
  olive: '#1f3d1f',
  green: '#2f6b2f',
  greenLight: '#4caf50',
  cream: '#f6efe2',
  yellow: '#f5c518',
  red: '#e5484d',
  ink: '#132015',
  white: '#ffffff',
};

const FPS = 30;
const VO = 5; // narration (and lip-synced presenter) start at frame 5
export const DURATION = 3450; // 115 s
const t = (s: number) => Math.round(s * FPS) + VO;
type Word = { word: string; start: number; end: number };
const W = WORDS as Word[];
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.out(Easing.cubic);
const pop = (f: number, at: number, damping = 12) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness: 210 } });
const shake = (f: number, at: number, amp = 12, len = 9) => {
  const k = f - at;
  if (k < 0 || k > len) return '';
  const a = amp * (1 - k / len);
  return `translate(${Math.sin(k * 2.7) * a}px, ${Math.cos(k * 3.1) * a}px)`;
};

// ---------- Scene timeline (seconds of the tightened narration) ----------
const S = {
  hook: 0,
  quedate: 4.45,
  tray: 7.2,
  dolor: 12.2,
  lista: 17.95,
  noeres: 26.1,
  twist: 31.4,
  mix: 35.25,
  cuenta: 38.05,
  dia: 50.3,
  nueve: 54.95,
  adivinar: 60.7,
  recetas: 62.95,
  asesor: 65.45,
  sin: 74.6,
  metodo: 78.3,
  bonos: 89.3,
  precio: 95.5,
  siete: 100.75,
  garantia: 103.9,
  cta: 108.6,
};
type Layout = 'full' | 'right' | 'none';
const LAYOUT: [number, Layout, { zoom?: number; origin?: string }?][] = [
  [S.hook, 'full', { zoom: 1.08, origin: '68% 35%' }],
  [S.quedate, 'full', { zoom: 1.45, origin: '68% 30%' }],
  [S.tray, 'right'],
  [S.dolor, 'none'],
  [S.lista, 'right'],
  [S.noeres, 'full', { zoom: 1.4, origin: '68% 30%' }],
  [S.twist, 'none'],
  [S.cuenta, 'right'],
  [S.dia, 'none'],
  [S.nueve, 'right'],
  [S.adivinar, 'full', { zoom: 1.35, origin: '68% 30%' }],
  [S.recetas, 'none'],
  [S.asesor, 'right'],
  [S.sin, 'none'],
  [S.metodo, 'right'],
  [S.bonos, 'none'],
  [S.precio, 'right'],
  [S.siete, 'none'],
  [S.garantia, 'full', { zoom: 1.2, origin: '68% 35%' }],
  [S.cta, 'right'],
];
const layoutAt = (f: number) => {
  let cur = LAYOUT[0];
  for (const l of LAYOUT) if (f >= t(l[0])) cur = l;
  return cur;
};

// ---------- Presenter (one continuous lip-synced clip, re-framed per scene) ----------
const Presenter: React.FC = () => {
  const f = useCurrentFrame();
  const [start, layout, opt] = layoutAt(f);
  const local = f - t(start);
  if (layout === 'none') return null;
  if (layout === 'full') {
    const z = opt?.zoom ?? 1;
    // Punch-in: cut in fast, then drift slowly.
    const s = interpolate(local, [0, 4, 120], [z + 0.12, z, z + 0.05], { ...clamp, easing: ease });
    return (
      <AbsoluteFill style={{ transform: `scale(${s}) ${shake(f, t(start), 8, 6)}`, transformOrigin: opt?.origin ?? '50% 40%' }}>
        <PresVideo />
      </AbsoluteFill>
    );
  }
  const s = interpolate(local, [0, 120], [1.04, 1.1], clamp);
  return (
    <div style={{ position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -760, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '72% 35%' }}>
        <PresVideo />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: C.yellow }} />
    </div>
  );
};
const PresVideo: React.FC = () => (
  <Sequence from={VO} layout="none">
    <OffthreadVideo src={staticFile('pres.mp4')} muted style={{ width: 1920, height: 1080, objectFit: 'cover' }} />
  </Sequence>
);

// ---------- Building blocks ----------
type Line = { t: string; c?: string; size?: number };
const Punch: React.FC<{ at: number; lines: Line[]; x?: number; y?: number; w?: number; align?: 'left' | 'center'; size?: number; until?: number }> = ({ at, lines, x = 80, y = 140, w = 860, align = 'left', size = 118, until }) => {
  const f = useCurrentFrame();
  const a = t(at);
  if (f < a || (until !== undefined && f >= t(until))) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: align, transform: shake(f, a, 10, 8) }}>
      {lines.map((l, i) => {
        const s = pop(f, a + i * 4, 11);
        return (
          <div key={i} style={{ fontFamily: INTER, fontWeight: 900, fontSize: l.size ?? size, lineHeight: 1.0, letterSpacing: -2, textTransform: 'uppercase', color: l.c ?? C.cream, transform: `scale(${interpolate(s, [0, 1], [1.7, 1])})`, transformOrigin: align === 'left' ? 'left center' : 'center', opacity: Math.min(1, s * 2), textShadow: '0 6px 30px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)' }}>
            {l.t}
          </div>
        );
      })}
    </div>
  );
};
const Shade: React.FC<{ side?: 'left' | 'all'; o?: number }> = ({ side = 'left', o = 0.75 }) => (
  <AbsoluteFill style={{ background: side === 'left' ? `linear-gradient(90deg, rgba(10,22,14,${o}) 0%, rgba(10,22,14,${o * 0.7}) 45%, rgba(10,22,14,0) 70%)` : `rgba(10,22,14,${o})` }} />
);
const KenBurns: React.FC<{ src: string; from: number; to: number; z0?: number; z1?: number; origin?: string; filter?: string }> = ({ src, from, to, z0 = 1.08, z1 = 1.2, origin = '50% 50%', filter }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [t(from), t(to)], [z0, z1], clamp);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: 1920, height: 1080, objectFit: 'cover', transform: `scale(${z})`, transformOrigin: origin, filter }} />
    </AbsoluteFill>
  );
};
const Clip: React.FC<{ src: string; from: number; rate?: number }> = ({ src, from, rate = 1 }) => (
  <Sequence from={t(from)} layout="none">
    <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{ position: 'absolute', width: 1920, height: 1080, objectFit: 'cover' }} />
  </Sequence>
);
const Card: React.FC<{ src: string; at: number; x: number; y: number; w: number; h: number; rot?: number; pos?: string }> = ({ src, at, x, y, w, h, rot = 0, pos = '50% 50%' }) => {
  const f = useCurrentFrame();
  const s = pop(f, t(at), 14);
  if (f < t(at)) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, overflow: 'hidden', border: `6px solid ${C.cream}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', transform: `translateY(${(1 - s) * 80}px) rotate(${rot * s}deg) scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 1.6) }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${interpolate(f, [t(at), t(at) + 150], [1.02, 1.12], clamp)})` }} />
    </div>
  );
};
const Stamp: React.FC<{ at: number; text: string; color?: string; x?: number; y?: number; size?: number; rot?: number }> = ({ at, text, color = C.yellow, x = 960, y = 460, size = 150, rot = -8 }) => {
  const f = useCurrentFrame();
  if (f < t(at)) return null;
  const s = pop(f, t(at), 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2.6, 1])}) ${shake(f, t(at) + 3, 18, 8)}`, opacity: Math.min(1, s * 1.8), padding: '14px 48px', border: `12px solid ${color}`, borderRadius: 26, color, background: 'rgba(10,22,14,0.55)', fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {text}
    </div>
  );
};
const Flash: React.FC<{ at: number; color?: string }> = ({ at, color = C.white }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [t(at), t(at) + 6], [0.75, 0], clamp);
  return o > 0 && f >= t(at) ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};
const LeftPanel: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 960, height: 1080, overflow: 'hidden', background: bg ?? `radial-gradient(900px 900px at 40% 35%, ${C.green}, ${C.bg} 75%)` }}>{children}</div>
);
const Tag: React.FC<{ text: string; bg?: string; color?: string; style?: React.CSSProperties }> = ({ text, bg = C.yellow, color = C.ink, style }) => (
  <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 999, background: bg, color, fontFamily: INTER, fontWeight: 900, fontSize: 30, letterSpacing: 2, textTransform: 'uppercase', ...style }}>{text}</div>
);

// ---------- Captions (word by word, active word in yellow) ----------
type Chunk = { words: Word[]; from: number; to: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, from: t(cur[0].start), to: 0 });
    cur = [];
  };
  for (const w of W) {
    cur.push(w);
    const len = cur.map((x) => x.word).join(' ').length;
    if (/[.,:!?…]$/.test(w.word) || cur.length >= 4 || len > 22) flush();
  }
  flush();
  out.forEach((c, i) => (c.to = i + 1 < out.length ? Math.min(out[i + 1].from, c.from + 75) : c.from + 45));
  return out;
})();
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const c = CHUNKS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const s = interpolate(f - c.from, [0, 4], [0.9, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', justifyContent: 'center', transform: `scale(${s})` }}>
      <div style={{ padding: '10px 30px', borderRadius: 20, background: 'rgba(10,22,14,0.82)', fontFamily: INTER, fontWeight: 900, fontSize: 64, lineHeight: 1.1, letterSpacing: -0.5, textTransform: 'uppercase', color: C.white, textAlign: 'center', maxWidth: 1700 }}>
        {c.words.map((w, i) => {
          const active = f >= t(w.start) && (i === c.words.length - 1 || f < t(c.words[i + 1].start));
          return (
            <span key={i} style={{ color: active ? C.yellow : C.white }}>
              {w.word.replace(/…/g, '')}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Scenes ----------
const Hook: React.FC = () => (
  <>
    <Shade o={0.7} />
    <Punch at={1.75} until={3.0} lines={[{ t: 'Una cuenta de', size: 70 }, { t: 'US$300', c: C.yellow, size: 210 }]} y={230} />
    <Punch at={3.0} until={S.quedate} lines={[{ t: '¿La puedes', size: 120 }, { t: 'pagar?', c: C.yellow, size: 190 }]} y={230} />
    <Flash at={1.75} />
  </>
);
const Quedate: React.FC = () => (
  <>
    <Shade o={0.6} />
    <Punch at={S.quedate + 0.1} until={6.0} lines={[{ t: 'Si dudaste', size: 120 }, { t: 'un segundo…', size: 110 }]} y={260} />
    <Punch at={6.0} lines={[{ t: '¡Quédate!', c: C.yellow, size: 190 }]} y={330} />
  </>
);
const Tray: React.FC = () => (
  <LeftPanel>
    <Card src="sc05.jpg" at={S.tray} x={70} y={70} w={820} h={470} rot={-2} pos="50% 40%" />
    <Punch at={9.2} lines={[{ t: 'Empiezas con', size: 64 }, { t: 'US$20', c: C.yellow, size: 190 }]} y={570} />
    <Punch at={10.35} lines={[{ t: 'Desde tu cocina', c: C.cream, size: 66 }]} y={830} />
  </LeftPanel>
);
const Dolor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <KenBurns src="sc09.jpg" from={S.dolor} to={S.lista} z0={1.05} z1={1.18} origin="55% 45%" filter="saturate(0.75)" />
      <Shade side="all" o={0.45} />
      <Punch at={S.dolor + 0.1} until={15.5} lines={[{ t: 'El sueldo', size: 130 }, { t: 'no alcanza', c: C.red, size: 150 }]} x={90} y={180} />
      {f >= t(15.5) && (
        <div style={{ position: 'absolute', left: 120, top: 150, width: 520, height: 560, borderRadius: 30, background: C.cream, boxShadow: '0 30px 90px rgba(0,0,0,0.6)', overflow: 'hidden', transform: `rotate(-4deg) scale(${pop(f, t(15.5))}) ${shake(f, t(15.6), 14)}` }}>
          <div style={{ height: 130, background: C.red, color: C.white, fontFamily: INTER, fontWeight: 900, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 6 }}>DÍA</div>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 330, color: C.ink, textAlign: 'center', lineHeight: 1.25 }}>20</div>
          <div style={{ position: 'absolute', left: 70, top: 160, width: 380, height: 380, border: `14px solid ${C.red}`, borderRadius: '50%', transform: 'rotate(-10deg)', clipPath: `inset(0 ${100 - interpolate(f, [t(15.7), t(16.3)], [0, 100], clamp)}% 0 0)` }} />
        </div>
      )}
      <Punch at={16.6} lines={[{ t: 'contando', size: 90 }, { t: 'monedas', c: C.yellow, size: 120 }]} x={700} y={300} w={1100} />
    </AbsoluteFill>
  );
};
const Lista: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { t: 'Pedir prestado', in: 18.0, strike: 18.9 },
    { t: 'Turnos extra', in: 19.1, strike: 20.4 },
    { t: 'Negocio de US$1.000', in: 20.85, strike: 23.45 },
  ];
  return (
    <LeftPanel>
      <Punch at={S.lista} lines={[{ t: 'Ya probaste…', c: C.yellow, size: 84 }]} y={90} />
      {items.map((it, i) => {
        if (f < t(it.in)) return null;
        const s = pop(f, t(it.in), 15);
        const k = interpolate(f, [t(it.strike), t(it.strike) + 7], [0, 1], { ...clamp, easing: ease });
        return (
          <div key={it.t} style={{ position: 'absolute', left: 80, top: 260 + i * 150, display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${(1 - s) * -200}px)`, opacity: Math.min(1, s * 1.5) * (k > 0.95 ? 0.6 : 1) }}>
            <div style={{ width: 74, height: 74, borderRadius: 16, border: `6px solid ${k > 0 ? C.red : C.cream}`, color: C.red, fontFamily: INTER, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k > 0.5 ? '✕' : ''}</div>
            <div style={{ position: 'relative', fontFamily: INTER, fontWeight: 900, fontSize: 66, color: C.cream, whiteSpace: 'nowrap' }}>
              {it.t}
              <div style={{ position: 'absolute', left: -8, top: '50%', height: 12, width: `${k * 106}%`, background: C.red, borderRadius: 6, transform: 'rotate(-2deg)' }} />
            </div>
          </div>
        );
      })}
      <Punch at={24.3} lines={[{ t: '…y terminas', size: 70 }, { t: 'igual o peor', c: C.red, size: 104 }]} y={730} />
    </LeftPanel>
  );
};
const NoEres: React.FC = () => (
  <>
    <Shade o={0.7} />
    <Punch at={S.noeres + 0.05} until={27.8} lines={[{ t: 'El problema', size: 110 }, { t: 'no eres tú', c: C.yellow, size: 160 }]} y={220} />
    <Punch at={28.9} lines={[{ t: 'Te faltó un negocio', size: 76 }, { t: 'con poco dinero', c: C.yellow, size: 100 }]} y={260} />
  </>
);
const Twist: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="sc10.jpg" from={S.twist} to={S.mix} z0={1.2} z1={1.05} origin="55% 50%" />
    <Shade o={0.55} />
    <Punch at={S.twist + 0.1} until={34.0} lines={[{ t: 'Ese negocio son…', size: 100 }]} y={170} />
    <Stamp at={34.05} text="¡Sí, barritas!" x={700} y={420} size={140} />
    <Flash at={34.05} color={C.yellow} />
  </AbsoluteFill>
);
const Mix: React.FC = () => (
  <AbsoluteFill>
    <Clip src="clip01.mp4" from={S.mix} rate={1.15} />
    <Shade o={0.6} />
    <Punch at={S.mix + 0.05} lines={[{ t: 'La gente las compra', size: 80 }, { t: 'todos los días', c: C.yellow, size: 128 }]} y={200} />
  </AbsoluteFill>
);
const Cuenta: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { l: 'Ingredientes', v: '$18', at: 39.3 },
    { l: 'Empaque', v: '$2', at: 41.45 },
    { l: 'Costo por barrita', v: '$1,00', at: 43.65 },
    { l: 'Precio de venta', v: '$2,50', at: 45.25 },
  ];
  const win = pop(f, t(47.45), 9);
  return (
    <LeftPanel>
      <Punch at={S.cuenta} lines={[{ t: 'Mira la cuenta', c: C.yellow, size: 78 }]} y={60} />
      <div style={{ position: 'absolute', left: 70, top: 190, width: 820, borderRadius: 30, background: C.cream, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', padding: '26px 40px', fontFamily: INTER }}>
        {rows.map((r) => {
          const s = pop(f, t(r.at), 15);
          return (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '2px dashed rgba(19,32,21,0.18)', opacity: f >= t(r.at) ? 1 : 0.12, transform: `translateX(${(1 - Math.min(1, s)) * -40}px)` }}>
              <span style={{ fontWeight: 800, fontSize: 46, color: C.ink }}>{r.l}</span>
              <span style={{ fontWeight: 900, fontSize: 72, color: r.l.startsWith('Precio') ? C.green : C.ink, transform: `scale(${f >= t(r.at) ? interpolate(s, [0, 1], [1.6, 1]) : 1})`, display: 'inline-block' }}>{r.v}</span>
            </div>
          );
        })}
      </div>
      {f >= t(47.45) && (
        <div style={{ position: 'absolute', left: 70, top: 720, width: 820, height: 210, borderRadius: 30, background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, transform: `scale(${interpolate(win, [0, 1], [1.5, 1])}) ${shake(f, t(47.5), 14)}`, boxShadow: '0 20px 70px rgba(245,197,24,0.55)', fontFamily: INTER }}>
          <span style={{ fontWeight: 900, fontSize: 52, color: C.ink }}>GANAS</span>
          <span style={{ fontWeight: 900, fontSize: 150, color: C.ink, letterSpacing: -4 }}>+$1,50</span>
        </div>
      )}
      <Flash at={47.45} color={C.yellow} />
    </LeftPanel>
  );
};
const NOTIFS = [
  { t: 'Nuevo pedido', b: '¿Tienes barritas hoy? 🙏', at: 50.5 },
  { t: 'Nuevo pedido', b: 'Quiero 6, porfa', at: 51.3 },
  { t: 'Nuevo pedido', b: 'Pedido: 12 · para el gym', at: 52.1 },
  { t: 'Nuevo pedido', b: '¿Me apartas 4 de chocolate?', at: 52.9 },
];
const Dia: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <KenBurns src="sc06.jpg" from={S.dia} to={S.nueve} z0={1.05} z1={1.15} origin="35% 45%" />
      <Shade o={0.7} />
      <Punch at={S.dia + 0.1} lines={[{ t: 'Vende 20 al día', size: 92 }]} y={110} />
      <Punch at={51.75} lines={[{ t: '20 × $1,50', size: 110 }, { t: '= $30', c: C.yellow, size: 210 }, { t: 'al día', size: 100 }]} y={250} />
      {f >= t(51.75) && <Tag text="Ejemplo" bg="rgba(246,239,226,0.9)" style={{ position: 'absolute', left: 84, top: 880, fontSize: 26 }} />}
      {NOTIFS.map((n, i) => {
        if (f < t(n.at)) return null;
        const s = spring({ frame: f - t(n.at), fps: FPS, config: { damping: 14, stiffness: 220 } });
        return (
          <div key={i} style={{ position: 'absolute', right: 70, top: 120 + i * 150, width: 760, display: 'flex', alignItems: 'center', gap: 22, padding: '20px 26px', borderRadius: 30, background: 'rgba(246,239,226,0.95)', boxShadow: '0 18px 50px rgba(0,0,0,0.45)', transform: `translateX(${(1 - s) * 500}px)`, opacity: Math.min(1, s * 1.5), fontFamily: INTER }}>
            <div style={{ width: 70, height: 70, borderRadius: 18, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>💬</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 32, color: C.green }}>{n.t}</div>
              <div style={{ fontWeight: 800, fontSize: 40, color: C.ink }}>{n.b}</div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 22, color: 'rgba(19,32,21,0.5)', alignSelf: 'flex-start' }}>ahora</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const Nueve: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [t(56.2), t(57.3)], [0, 9500], { ...clamp, easing: ease }));
  return (
    <LeftPanel>
      <Punch at={S.nueve + 0.1} lines={[{ t: 'Por eso', size: 70 }]} y={80} />
      {f >= t(56.2) && (
        <div style={{ position: 'absolute', left: 80, top: 170, fontFamily: INTER, fontWeight: 900, fontSize: 220, color: C.yellow, letterSpacing: -6, transform: `scale(${interpolate(pop(f, t(56.2)), [0, 1], [1.4, 1])})`, transformOrigin: 'left center' }}>
          +{n.toLocaleString('es-MX').replace(',', '.')}
        </div>
      )}
      <Punch at={57.2} lines={[{ t: 'personas', size: 86 }, { t: 'ya empezaron', c: C.cream, size: 86 }]} y={420} />
      <Card src="metodo.jpg" at={58.95} x={470} y={560} w={400} h={400} rot={4} />
    </LeftPanel>
  );
};
const Adivinar: React.FC = () => (
  <>
    <Shade o={0.7} />
    <Punch at={S.adivinar + 0.05} lines={[{ t: 'No tienes que', size: 100 }, { t: 'adivinar', c: C.yellow, size: 170 }, { t: 'nada', size: 130 }]} y={190} />
  </>
);
const Recetas: React.FC = () => (
  <AbsoluteFill>
    <Clip src="clip04.mp4" from={S.recetas} rate={1.0} />
    <Shade o={0.55} />
    <Punch at={64.3} lines={[{ t: '+30', c: C.yellow, size: 260 }, { t: 'recetas', size: 120 }]} y={170} />
    <Flash at={64.3} color={C.yellow} />
  </AbsoluteFill>
);
const Asesor: React.FC = () => {
  const f = useCurrentFrame();
  const q = '¿Cuánto cobro por barrita?';
  const typed = Math.min(q.length, Math.max(0, Math.floor((f - t(67.45)) * 1.4)));
  const bubbles = [
    { at: 69.35, txt: 'Costo $1 · Precio $2,50 → +$1,50 ✅' },
    { at: 70.45, txt: 'Plan: lun 20 · mié 20 · vie 30 📅' },
    { at: 72.2, txt: '«¡Hola! 🍫 Barritas caseras a $2,50. ¿Te aparto unas?»' },
  ];
  return (
    <LeftPanel>
      <Img src={staticFile('asesor.png')} style={{ position: 'absolute', left: 60, top: 40, width: 190, transform: `scale(${pop(f, t(S.asesor))}) translateY(${Math.sin(f / 10) * 6}px)` }} />
      <Punch at={S.asesor + 0.1} lines={[{ t: 'Tu Asesor IA', c: C.yellow, size: 76 }]} x={280} y={90} w={640} />
      <div style={{ position: 'absolute', left: 60, top: 270, width: 840, padding: '22px 28px', borderRadius: 24, background: C.cream, border: `4px solid ${C.yellow}`, fontFamily: INTER, fontWeight: 900, fontSize: 50, color: C.ink, minHeight: 60, opacity: f >= t(67.3) ? 1 : 0.4 }}>
        {q.slice(0, typed)}
        {f < t(69.3) && Math.floor(f / 8) % 2 === 0 && <span style={{ color: C.green }}>|</span>}
      </div>
      {bubbles.map((b, i) => {
        if (f < t(b.at)) return null;
        const s = pop(f, t(b.at), 15);
        return (
          <div key={i} style={{ position: 'absolute', left: 60, top: 420 + i * 175, width: 840, padding: '22px 28px', borderRadius: 24, background: i === 2 ? '#dcf8c6' : 'rgba(246,239,226,0.92)', fontFamily: INTER, fontWeight: 800, fontSize: 46, lineHeight: 1.2, color: C.ink, transform: `translateY(${(1 - s) * 40}px)`, opacity: Math.min(1, s * 1.5), boxShadow: '0 14px 40px rgba(0,0,0,0.35)' }}>
            {b.txt}
          </div>
        );
      })}
    </LeftPanel>
  );
};
const Sin: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { t: 'Sin experiencia', at: 75.0 },
    { t: 'Sin máquinas', at: 76.15 },
    { t: 'Sin mucho dinero', at: 77.15 },
  ];
  return (
    <AbsoluteFill>
      <Clip src="clip07.mp4" from={S.sin} rate={1.0} />
      <Shade o={0.7} />
      {items.map((it, i) => {
        if (f < t(it.at)) return null;
        const s = pop(f, t(it.at), 11);
        return (
          <div key={it.t} style={{ position: 'absolute', left: 90, top: 200 + i * 190, display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`, transformOrigin: 'left center', opacity: Math.min(1, s * 2) }}>
            <div style={{ width: 110, height: 110, borderRadius: 26, background: C.greenLight, color: C.white, fontFamily: INTER, fontWeight: 900, fontSize: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 104, color: C.cream, textTransform: 'uppercase', letterSpacing: -2, textShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>{it.t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const Metodo: React.FC = () => {
  const f = useCurrentFrame();
  const chips = [
    { t: 'Recetas', at: 80.1 },
    { t: 'Costos', at: 81.0 },
    { t: 'Precios', at: 81.7 },
    { t: 'Mensajes listos', at: 82.4 },
  ];
  const drop = (at: number) => spring({ frame: f - t(at), fps: FPS, config: { damping: 9, stiffness: 140 } });
  return (
    <LeftPanel>
      <Punch at={S.metodo + 0.05} lines={[{ t: 'Te llevas', size: 64 }, { t: 'el método completo', c: C.yellow, size: 70 }]} y={50} />
      {f >= t(78.85) && (
        <div style={{ position: 'absolute', left: 60, top: 250, width: 420, height: 420, transform: `translateY(${interpolate(drop(78.85), [0, 1], [-900, 0])}px) rotate(-3deg)` }}>
          <Img src={staticFile('metodo.jpg')} style={{ width: 420, height: 420, borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 505, top: 250, display: 'flex', flexDirection: 'column', gap: 22, width: 440 }}>
        {chips.map((c) => (f >= t(c.at) ? <Tag key={c.t} text={`✓ ${c.t}`} bg={C.cream} style={{ fontSize: 42, transform: `scale(${pop(f, t(c.at))})`, transformOrigin: 'left center' }} /> : null))}
      </div>
      {f >= t(83.7) && (
        <div style={{ position: 'absolute', left: 60, top: 720, width: 840, height: 250, borderRadius: 30, background: C.cream, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', transform: `scale(${pop(f, t(83.7))})`, boxShadow: '0 20px 60px rgba(0,0,0,0.45)', fontFamily: INTER }}>
          <Img src={staticFile('asesor.png')} style={{ height: 200 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 52, color: C.ink }}>Asesor de Negocios IA</div>
            <div style={{ fontWeight: 800, fontSize: 38, color: C.green }}>Dentro de ChatGPT · {f >= t(87.8) ? '24/7' : ''}</div>
          </div>
        </div>
      )}
    </LeftPanel>
  );
};
const Bonos: React.FC = () => {
  const f = useCurrentFrame();
  const list = [
    { src: 'bono-kit.jpg', v: 'US$47', at: 89.45 },
    { src: 'bono-premium.jpg', v: 'US$37', at: 90.4 },
    { src: 'bono-megapack.jpg', v: 'US$27', at: 91.3 },
  ];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 800px at 50% 40%, ${C.green}, ${C.bg} 75%)` }}>
      <Punch at={S.bonos + 0.05} lines={[{ t: '+ 3 bonos', c: C.yellow, size: 110 }]} y={40} w={1760} align="center" />
      {list.map((b, i) => {
        if (f < t(b.at)) return null;
        const s = spring({ frame: f - t(b.at), fps: FPS, config: { damping: 10, stiffness: 150 } });
        const hl = i === 1 && f >= t(91.2);
        return (
          <div key={b.src} style={{ position: 'absolute', left: 90 + i * 590, top: 230, width: 560, transform: `translateY(${interpolate(s, [0, 1], [-900, 0])}px) scale(${hl ? 1.08 : 1})`, transition: 'none' }}>
            <Img src={staticFile(b.src)} style={{ width: 560, height: 373, borderRadius: 22, border: `6px solid ${hl ? C.yellow : C.cream}`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', objectFit: 'cover' }} />
            <Tag text={`Valor ${b.v}`} style={{ position: 'absolute', left: 20, top: -24 }} />
          </div>
        );
      })}
      <Punch at={93.5} lines={[{ t: 'Gimnasios al doble de precio', c: C.cream, size: 66 }]} y={690} w={1760} align="center" />
    </AbsoluteFill>
  );
};
const Precio: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [t(97.4), t(97.75)], [0, 1], clamp);
  const p = pop(f, t(98.3), 9);
  return (
    <LeftPanel>
      <Punch at={S.precio + 0.05} lines={[{ t: 'Todo vale', size: 70 }]} y={80} />
      {f >= t(96.0) && (
        <div style={{ position: 'absolute', left: 80, top: 170, fontFamily: INTER, fontWeight: 900, fontSize: 170, color: 'rgba(246,239,226,0.75)', transform: `scale(${pop(f, t(96.0))})`, transformOrigin: 'left center' }}>
          <span style={{ position: 'relative' }}>
            US$57
            <span style={{ position: 'absolute', left: -10, top: '52%', height: 16, width: `${strike * 112}%`, background: C.red, borderRadius: 8, transform: 'rotate(-6deg)' }} />
          </span>
        </div>
      )}
      {f >= t(98.3) && (
        <div style={{ position: 'absolute', left: 60, top: 420, fontFamily: INTER, color: C.yellow, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) ${shake(f, t(98.35), 16)}`, transformOrigin: 'left center' }}>
          <div style={{ fontWeight: 900, fontSize: 64, color: C.cream }}>Tú pagas solo</div>
          <div style={{ fontWeight: 900, fontSize: 210, letterSpacing: -6, lineHeight: 1 }}>US$9,90</div>
        </div>
      )}
      {f >= t(99.5) && <Tag text="Pago único · Sin mensualidades" bg={C.cream} style={{ position: 'absolute', left: 80, top: 790, fontSize: 32, transform: `scale(${pop(f, t(99.5))})`, transformOrigin: 'left center' }} />}
      <Stamp at={98.9} text="Ahorra 80%" x={740} y={362} size={50} rot={-5} color={C.red} />
      <Flash at={98.3} color={C.yellow} />
    </LeftPanel>
  );
};
const Siete: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 800px at 50% 45%, ${C.green}, ${C.bg} 75%)` }}>
      <Punch at={S.siete + 0.05} lines={[{ t: 'Menos de lo que ganas con', size: 74 }]} y={110} w={1760} align="center" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const at = 101.9 + i * 0.13;
          const s = pop(f, t(at), 10);
          return (
            <div key={i} style={{ width: 170, height: 300, borderRadius: 22, background: 'linear-gradient(160deg, #c9965f, #8a5a2b)', border: `6px solid ${C.cream}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', transform: `translateY(${(1 - s) * -400}px) rotate(${(i - 3) * 2}deg)`, opacity: f >= t(at) ? 1 : 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 120, height: 60, background: C.cream }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 38, color: C.green }}>+$1,50</div>
            </div>
          );
        })}
      </div>
      <Punch at={102.6} lines={[{ t: '7 barritas = $10,50  >  $9,90', c: C.yellow, size: 92 }]} y={680} w={1760} align="center" />
    </AbsoluteFill>
  );
};
const Garantia: React.FC = () => {
  const f = useCurrentFrame();
  const s = pop(f, t(104.45), 10);
  return (
    <>
      <Shade o={0.65} />
      {f >= t(104.45) && (
        <div style={{ position: 'absolute', left: 120, top: 170, width: 560, height: 560, borderRadius: '50%', background: C.yellow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 90px rgba(245,197,24,0.45)', transform: `scale(${interpolate(s, [0, 1], [2, 1])}) rotate(${-8 + Math.sin(f / 20) * 2}deg)`, fontFamily: INTER, color: C.ink, border: `14px dashed ${C.ink}` }}>
          <div style={{ fontWeight: 900, fontSize: 180, lineHeight: 0.9 }}>7</div>
          <div style={{ fontWeight: 900, fontSize: 64 }}>DÍAS</div>
          <div style={{ fontWeight: 800, fontSize: 40, marginTop: 10 }}>100% reembolso</div>
        </div>
      )}
    </>
  );
};
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const s = pop(f, t(108.65), 10);
  const pulse = 1 + 0.045 * Math.sin(Math.max(0, f - t(108.65)) * 0.35);
  const arrow = Math.abs(Math.sin(f / 6)) * 22;
  return (
    <LeftPanel>
      <Punch at={S.cta + 0.05} lines={[{ t: 'Toca el botón', c: C.yellow, size: 104 }, { t: 'ahora', size: 104 }]} y={90} />
      {f >= t(108.65) && (
        <div style={{ position: 'absolute', left: 60, top: 430, width: 840, transform: `scale(${s * pulse})` }}>
          <div style={{ padding: '38px 30px', borderRadius: 30, background: C.yellow, boxShadow: '0 22px 70px rgba(245,197,24,0.6)', fontFamily: INTER, fontWeight: 900, fontSize: 50, color: C.ink, textAlign: 'center', lineHeight: 1.1 }}>
            QUIERO EMPEZAR A GENERAR INGRESOS EXTRA →
          </div>
          <div style={{ marginTop: 18, textAlign: 'center', fontFamily: INTER, fontWeight: 800, fontSize: 32, color: C.cream }}>US$9,90 · Pago único · Garantía de 7 días</div>
        </div>
      )}
      <Punch at={109.95} lines={[{ t: 'Tu primera tanda', c: C.cream, size: 64 }, { t: 'este fin de semana', c: C.yellow, size: 64 }]} y={800} />
      <svg width="90" height="90" viewBox="0 0 24 24" style={{ position: 'absolute', left: 435, top: 700 + arrow, opacity: f >= t(108.65) ? 1 : 0 }}>
        <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke={C.yellow} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </LeftPanel>
  );
};

// ---------- Audio ----------
const Sfx: React.FC<{ at: number; src: string; v: number }> = ({ at, src, v }) => (
  <Sequence from={Math.max(0, t(at))} layout="none">
    <Audio src={staticFile(src)} volume={v} />
  </Sequence>
);
const NO_MUSIC = Boolean((getInputProps() as { noMusic?: boolean }).noMusic);
const Music: React.FC = () => {
  const f = useCurrentFrame();
  if (NO_MUSIC) return null;
  const v = interpolate(f, [0, 6, t(S.dolor) - 4, t(S.dolor) + 6, t(S.twist), t(S.twist) + 8, t(S.cta), DURATION - 40, DURATION], [0, 0.16, 0.16, 0.1, 0.1, 0.17, 0.16, 0.17, 0], clamp);
  return <Audio src={staticFile('music.wav')} volume={() => v} />;
};
const SCENE_CUTS = [S.quedate, S.tray, S.dolor, S.lista, S.noeres, S.twist, S.mix, S.cuenta, S.dia, S.nueve, S.adivinar, S.recetas, S.asesor, S.sin, S.metodo, S.bonos, S.precio, S.siete, S.garantia, S.cta];

const between = (f: number, a: number, b: number) => f >= t(a) && f < t(b);
const Scenes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {between(f, S.dolor, S.lista) && <Dolor />}
      {between(f, S.twist, S.mix) && <Twist />}
      {between(f, S.mix, S.cuenta) && <Mix />}
      {between(f, S.dia, S.nueve) && <Dia />}
      {between(f, S.recetas, S.asesor) && <Recetas />}
      {between(f, S.sin, S.metodo) && <Sin />}
      {between(f, S.bonos, S.precio) && <Bonos />}
      {between(f, S.siete, S.garantia) && <Siete />}
      <Presenter />
      {between(f, S.hook, S.quedate) && <Hook />}
      {between(f, S.quedate, S.tray) && <Quedate />}
      {between(f, S.tray, S.dolor) && <Tray />}
      {between(f, S.lista, S.noeres) && <Lista />}
      {between(f, S.noeres, S.twist) && <NoEres />}
      {between(f, S.cuenta, S.dia) && <Cuenta />}
      {between(f, S.nueve, S.adivinar) && <Nueve />}
      {between(f, S.adivinar, S.recetas) && <Adivinar />}
      {between(f, S.asesor, S.sin) && <Asesor />}
      {between(f, S.metodo, S.bonos) && <Metodo />}
      {between(f, S.precio, S.siete) && <Precio />}
      {between(f, S.garantia, S.cta) && <Garantia />}
      {f >= t(S.cta) && <Cta />}
    </>
  );
};

export const Vsl: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Scenes />
    <Captions />

    <Music />
    <Sequence from={VO} layout="none">
      <Audio src={staticFile('vo.wav')} />
    </Sequence>
    <Sfx at={0} src="subdrop.mp3" v={0.45} />
    <Sfx at={1.75} src="hit_sub.mp3" v={0.4} />
    <Sfx at={3.0} src="scratch.mp3" v={0.3} />
    <Sfx at={6.0} src="boom_low.mp3" v={0.35} />
    <Sfx at={9.2} src="register.mp3" v={0.28} />
    <Sfx at={15.5} src="hit_sub.mp3" v={0.4} />
    <Sfx at={15.7} src="scribble.mp3" v={0.35} />
    {[18.9, 20.4, 23.45].map((s) => (
      <Sfx key={s} at={s} src="scribble.mp3" v={0.4} />
    ))}
    <Sfx at={26.1} src="boom_low.mp3" v={0.35} />
    <Sfx at={32.9} src="riser.mp3" v={0.3} />
    <Sfx at={34.05} src="hit_sub.mp3" v={0.45} />
    <Sfx at={34.05} src="sparkle.mp3" v={0.35} />
    {[39.3, 41.45, 43.65, 45.25].map((s) => (
      <Sfx key={s} at={s} src="pop.mp3" v={0.35} />
    ))}
    <Sfx at={47.45} src="register.mp3" v={0.4} />
    {NOTIFS.map((n) => (
      <Sfx key={n.at} at={n.at} src="notif.mp3" v={0.22} />
    ))}
    <Sfx at={51.75} src="hit_sub.mp3" v={0.35} />
    <Sfx at={56.2} src="riser.mp3" v={0.22} />
    <Sfx at={58.95} src="pop.mp3" v={0.35} />
    <Sfx at={64.3} src="hit_sub.mp3" v={0.35} />
    <Sfx at={67.45} src="typing.mp3" v={0.35} />
    {[69.35, 70.45, 72.2].map((s) => (
      <Sfx key={s} at={s} src="pop.mp3" v={0.3} />
    ))}
    {[75.0, 76.15, 77.15].map((s) => (
      <Sfx key={s} at={s} src="pop.mp3" v={0.35} />
    ))}
    <Sfx at={78.85} src="boom_low.mp3" v={0.3} />
    {[80.1, 81.0, 81.7, 82.4].map((s) => (
      <Sfx key={s} at={s} src="pop.mp3" v={0.28} />
    ))}
    <Sfx at={83.7} src="unlock.mp3" v={0.3} />
    {[89.45, 90.4, 91.3].map((s) => (
      <Sfx key={s} at={s} src="boom_low.mp3" v={0.28} />
    ))}
    <Sfx at={97.4} src="scribble.mp3" v={0.35} />
    <Sfx at={98.3} src="register.mp3" v={0.45} />
    <Sfx at={98.9} src="hit_sub.mp3" v={0.35} />
    {Array.from({ length: 7 }).map((_, i) => (
      <Sfx key={i} at={101.9 + i * 0.13} src="pop.mp3" v={0.25} />
    ))}
    <Sfx at={104.45} src="sparkle.mp3" v={0.35} />
    <Sfx at={108.65} src="hit_sub.mp3" v={0.4} />
    {SCENE_CUTS.map((s) => (
      <Sfx key={`w${s}`} at={s - 0.12} src="whoosh.mp3" v={0.22} />
    ))}
  </AbsoluteFill>
);
