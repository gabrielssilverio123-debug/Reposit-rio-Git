// Variação 1 do criativo validado de Barritas Que Venden: ângulo "uma manhã por semana" (renda extra), 9:16.
import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, getInputProps, useCurrentFrame } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import WORDS from '../public/words.json';

const { fontFamily: INTER } = loadInter('normal', { weights: ['700', '800', '900'], subsets: ['latin', 'latin-ext'] });

// Estilo do criativo validado: branco com contorno, destaque laranja, títulos em caixa alta.
const C = { orange: '#ff8a00', yellow: '#ffd23f', red: '#ff3b3b', green: '#2fbf5b', white: '#ffffff', ink: '#1a120b', cream: '#fff6e8' };
const FPS = 30;
const VO = 5;
export const DURATION = 1150;
const t = (s: number) => Math.round(s * FPS) + VO;
type Word = { word: string; start: number; end: number };
const W = WORDS as Word[];
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.out(Easing.cubic);
const pop = (f: number, at: number, damping = 11) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness: 220 } });
const shake = (f: number, at: number, amp = 14, len = 8) => {
  const k = f - at;
  if (k < 0 || k > len) return '';
  const a = amp * (1 - k / len);
  return `translate(${Math.sin(k * 2.7) * a}px, ${Math.cos(k * 3.1) * a}px)`;
};
const between = (f: number, a: number, b: number) => f >= t(a) && f < t(b);
const outline = '0 0 2px #000, 0 0 2px #000, 0 4px 14px rgba(0,0,0,0.85), 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000';

// ---------- Fundo ----------
const Still: React.FC<{ src: string; from: number; to: number; z0?: number; z1?: number; origin?: string }> = ({ src, from, to, z0 = 1.05, z1 = 1.18, origin = '50% 50%' }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [t(from), t(to)], [z0, z1], clamp);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${z})`, transformOrigin: origin }} />
    </AbsoluteFill>
  );
};
const Clip: React.FC<{ src: string; from: number; startFrom?: number; rate?: number; fit?: 'fill' | 'frame'; z?: number }> = ({ src, from, startFrom = 0, rate = 1, fit = 'fill', z = 1 }) => (
  <Sequence from={t(from)} layout="none">
    {fit === 'fill' ? (
      <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={rate} muted style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${z})` }} />
    ) : (
      <>
        <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={rate} muted style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(28px) brightness(0.55)', transform: 'scale(1.15)' }} />
        <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={rate} muted style={{ position: 'absolute', left: 0, top: 380, width: 1080, height: 1080, objectFit: 'cover', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
      </>
    )}
  </Sequence>
);
const Dim: React.FC<{ o?: number }> = ({ o = 0.35 }) => <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${o + 0.15}) 0%, rgba(0,0,0,${o * 0.4}) 35%, rgba(0,0,0,${o * 0.4}) 55%, rgba(0,0,0,${o + 0.2}) 100%)` }} />;

// ---------- Textos ----------
const Title: React.FC<{ at: number; until?: number; text: string; color?: string; size?: number; top?: number }> = ({ at, until, text, color = C.yellow, size = 92, top = 280 }) => {
  const f = useCurrentFrame();
  if (f < t(at) || (until !== undefined && f >= t(until))) return null;
  const s = pop(f, t(at));
  return (
    <div style={{ position: 'absolute', left: 50, right: 130, top, textAlign: 'center', transform: `scale(${interpolate(s, [0, 1], [1.8, 1])}) ${shake(f, t(at) + 2)}`, opacity: Math.min(1, s * 2) }}>
      <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -1, textTransform: 'uppercase', color, textShadow: outline }}>{text}</span>
    </div>
  );
};
const Slam: React.FC<{ at: number; until: number; text: string; color?: string; size?: number; top?: number }> = ({ at, until, text, color = C.orange, size = 200, top = 760 }) => {
  const f = useCurrentFrame();
  if (f < t(at) || f >= t(until)) return null;
  const sc = interpolate(f - t(at), [0, 4, 7], [3, 0.94, 1], { ...clamp, easing: ease });
  const flash = interpolate(f - t(at), [0, 5], [0.45, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, t(at) + 3, 20) }}>
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
      <div style={{ position: 'absolute', left: 40, right: 140, top, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: -5, lineHeight: 1, color, textShadow: outline, transform: `scale(${sc})` }}>{text}</div>
    </AbsoluteFill>
  );
};
const Tag: React.FC<{ text: string; bg?: string; color?: string; style?: React.CSSProperties }> = ({ text, bg = C.yellow, color = C.ink, style }) => (
  <div style={{ display: 'inline-block', padding: '12px 26px', borderRadius: 999, background: bg, color, fontFamily: INTER, fontWeight: 900, fontSize: 40, letterSpacing: 1, textTransform: 'uppercase', textShadow: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.45)', ...style }}>{text}</div>
);

// ---------- Legendas palavra por palavra (laranja na palavra ativa, como o validado) ----------
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
    if (/[.,:!?…]$/.test(w.word) || cur.length >= 3) flush();
  }
  flush();
  out.forEach((c, i) => (c.to = i + 1 < out.length ? Math.min(out[i + 1].from, c.from + 60) : c.from + 40));
  return out;
})();
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= t(34.9)) return null; // o botão do CTA assume
  const c = CHUNKS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const s = interpolate(f - c.from, [0, 4], [0.8, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', left: 40, right: 140, top: 1250, textAlign: 'center', transform: `scale(${s})` }}>
      {c.words.map((w, i) => {
        const active = f >= t(w.start) && (i === c.words.length - 1 || f < t(c.words[i + 1].start));
        return (
          <span key={i} style={{ fontFamily: INTER, fontWeight: 900, fontSize: 82, lineHeight: 1.1, color: active ? C.orange : C.white, textShadow: outline }}>
            {w.word.replace(/[…:]/g, '').replace(/\.$/, '')}
            {i < c.words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

// ---------- Cenas ----------
const S = { a: 0, a2: 1.6, b: 5.5, c: 7.45, d: 11.55, d2: 13.25, e: 15.05, f: 21.6, g: 24.65, h: 29.05, i: 32.75 };

const Lista: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [t(6.75), t(6.75) + 6], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', left: 60, right: 140, top: 520, textAlign: 'center' }}>
      <span style={{ position: 'relative', fontFamily: INTER, fontWeight: 900, fontSize: 88, color: C.white, textShadow: outline, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        <span style={{ color: C.red }}>✕ </span>de una en una
        <span style={{ position: 'absolute', left: -10, top: '50%', height: 16, width: `${k * 108}%`, background: C.red, borderRadius: 8, transform: 'rotate(-3deg)' }} />
      </span>
    </div>
  );
};
const Lugares: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { t: '✓ Tu trabajo', at: 12.37 },
    { t: '✓ El gimnasio', at: 13.47 },
    { t: '✓ La escuela', at: 14.24 },
  ];
  return (
    <div style={{ position: 'absolute', left: 60, top: 420, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {items.map((it) => (f >= t(it.at) ? <Tag key={it.t} text={it.t} style={{ fontSize: 58, transform: `scale(${pop(f, t(it.at))})`, transformOrigin: 'left center' }} /> : null))}
    </div>
  );
};
const Cuenta: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { l: 'Te cuesta', v: '$1,00', at: 15.6, c: C.white },
    { l: 'La vendes', v: '$2,50', at: 16.95, c: C.white },
  ];
  const gana = pop(f, t(17.5), 9);
  const w20 = pop(f, t(18.8), 10);
  const w40 = pop(f, t(20.9), 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 70, right: 150, top: 300, padding: '26px 34px', borderRadius: 32, background: 'rgba(15,10,5,0.78)', fontFamily: INTER }}>
        {rows.map((r) => (
          <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: f >= t(r.at) ? 1 : 0.15 }}>
            <span style={{ fontWeight: 800, fontSize: 54, color: C.cream }}>{r.l}</span>
            <span style={{ fontWeight: 900, fontSize: 84, color: r.c, transform: `scale(${f >= t(r.at) ? interpolate(pop(f, t(r.at)), [0, 1], [1.6, 1]) : 1})`, display: 'inline-block' }}>{r.v}</span>
          </div>
        ))}
        {f >= t(17.5) && (
          <div style={{ marginTop: 14, padding: '12px 0', borderRadius: 20, background: C.orange, textAlign: 'center', transform: `scale(${interpolate(gana, [0, 1], [1.5, 1])}) ${shake(f, t(17.55), 12)}` }}>
            <span style={{ fontWeight: 900, fontSize: 92, color: C.white, textShadow: '0 3px 0 #000' }}>+$1,50 c/u</span>
          </div>
        )}
      </div>
      {f >= t(18.8) && (
        <div style={{ position: 'absolute', left: 70, right: 150, top: 820, textAlign: 'center', fontFamily: INTER, fontWeight: 900, color: C.white, textShadow: outline }}>
          <div style={{ fontSize: 78, transform: `scale(${w20})` }}>20/semana = <span style={{ color: C.yellow }}>+$30</span></div>
          {f >= t(20.9) && <div style={{ fontSize: 78, transform: `scale(${w40})` }}>40/semana = <span style={{ color: C.yellow }}>+$60</span></div>}
          <Tag text="Ejemplo" bg="rgba(255,246,232,0.92)" style={{ fontSize: 26, marginTop: 10 }} />
        </div>
      )}
    </>
  );
};
const Sin: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { t: 'Sin local', at: 21.75 },
    { t: 'Sin máquinas', at: 22.66 },
    { t: 'Sin experiencia', at: 23.62 },
  ];
  return (
    <div style={{ position: 'absolute', left: 70, top: 360, display: 'flex', flexDirection: 'column', gap: 26 }}>
      {items.map((it) => {
        if (f < t(it.at)) return null;
        const s = pop(f, t(it.at), 10);
        return (
          <div key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`, transformOrigin: 'left center' }}>
            <div style={{ width: 96, height: 96, borderRadius: 22, background: C.green, color: C.white, fontFamily: INTER, fontWeight: 900, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 84, color: C.white, textShadow: outline, textTransform: 'uppercase' }}>{it.t}</span>
          </div>
        );
      })}
    </div>
  );
};
const Caso: React.FC = () => {
  const f = useCurrentFrame();
  const n = pop(f, t(26.86), 14);
  return (
    <>
      <Title at={24.75} text="Caso real" color={C.white} size={70} top={260} />
      <Title at={24.75} text="Eugenia" color={C.orange} size={120} top={340} />
      {f >= t(26.86) && (
        <div style={{ position: 'absolute', left: 60, right: 140, top: 560, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 26px', borderRadius: 30, background: 'rgba(255,246,232,0.96)', boxShadow: '0 18px 50px rgba(0,0,0,0.5)', transform: `translateY(${(1 - n) * -200}px)`, opacity: Math.min(1, n * 1.5), fontFamily: INTER }}>
          <div style={{ width: 76, height: 76, borderRadius: 18, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>🏪</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 34, color: C.orange }}>De 1 bandeja de prueba…</div>
            <div style={{ fontWeight: 900, fontSize: 44, color: C.ink }}>a 3 puntos de venta fijos</div>
          </div>
        </div>
      )}
      <Slam at={27.4} until={28.9} text="3 PUNTOS FIJOS" color={C.yellow} size={120} top={800} />
    </>
  );
};
const Metodo: React.FC = () => {
  const f = useCurrentFrame();
  const chips = [
    { t: '✓ +30 recetas', at: 29.2 },
    { t: '✓ Precios', at: 29.95 },
    { t: '✓ Asesor IA', at: 30.85 },
  ];
  return (
    <div style={{ position: 'absolute', left: 50, right: 140, top: 250, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
      {chips.map((c) => (f >= t(c.at) ? <Tag key={c.t} text={c.t} style={{ fontSize: 44, transform: `scale(${pop(f, t(c.at))})` }} /> : null))}
    </div>
  );
};
const Oferta: React.FC = () => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [t(32.95), t(33.2)], [0, 1], clamp);
  const p = pop(f, t(33.25), 9);
  const cta = pop(f, t(34.9), 10);
  const pulse = 1 + 0.05 * Math.sin(Math.max(0, f - t(34.9)) * 0.4);
  const arrow = Math.abs(Math.sin(f / 6)) * 20;
  return (
    <>
      <div style={{ position: 'absolute', left: 30, right: 130, top: 235, padding: '18px 10px 22px', minHeight: 300, borderRadius: 30, background: 'rgba(12,8,4,0.92)', textAlign: 'center', fontFamily: INTER, fontWeight: 900, textShadow: outline }}>
        <span style={{ position: 'relative', fontSize: 80, color: 'rgba(255,255,255,0.8)', marginRight: 20 }}>
          US$57
          <span style={{ position: 'absolute', left: -6, top: '52%', height: 12, width: `${strike * 112}%`, background: C.red, borderRadius: 6, transform: 'rotate(-6deg)' }} />
        </span>
        {f >= t(33.25) && <span style={{ display: 'inline-block', fontSize: 140, color: C.yellow, transform: `scale(${interpolate(p, [0, 1], [1.7, 1])})` }}>US$9,90</span>}
        {f >= t(33.25) && <div><Tag text="Ahorra 80% · pago único" bg={C.red} color={C.white} style={{ fontSize: 34, marginTop: 6 }} /></div>}
      </div>
      {f >= t(34.9) && (
        <div style={{ position: 'absolute', left: 60, right: 140, top: 1250, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${cta * pulse})` }}>
          <div style={{ padding: '30px 40px', borderRadius: 999, background: C.orange, fontFamily: INTER, fontWeight: 900, fontSize: 54, color: C.white, textShadow: '0 3px 0 rgba(0,0,0,0.4)', boxShadow: '0 16px 50px rgba(255,138,0,0.6)', whiteSpace: 'nowrap' }}>EMPIEZA ESTE DOMINGO</div>
          <div style={{ fontSize: 80, marginTop: 4 + arrow }}>👇</div>
        </div>
      )}
    </>
  );
};

const Scenes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {between(f, S.a, S.a2) && (
        <AbsoluteFill>
          <Clip src="v_morder.mp4" from={S.a} z={1.05} />
          <Dim />
          <Title at={0} text="1 mañana de domingo" color={C.white} size={96} top={300} />
        </AbsoluteFill>
      )}
      {between(f, S.a2, S.b) && (
        <AbsoluteFill>
          <Still src="mezcla.jpg" from={S.a2} to={S.b} z0={1.12} z1={1.02} origin="35% 60%" />
          <Dim />
          <Title at={S.a2} text="= dinero extra" color={C.yellow} size={100} top={290} />
          <Slam at={3.94} until={S.b} text="TODA LA SEMANA" color={C.orange} size={112} top={560} />
        </AbsoluteFill>
      )}
      {between(f, S.b, S.c) && (
        <AbsoluteFill>
          <Clip src="v_choco.mp4" from={S.b} z={1.0} />
          <Dim o={0.45} />
          <Lista />
        </AbsoluteFill>
      )}
      {between(f, S.c, S.d) && (
        <AbsoluteFill>
          <Clip src="c_bandeja.mp4" from={S.c} />
          <Dim />
          <Title at={S.c + 0.05} text="Domingo:" color={C.white} size={100} top={290} />
          <Title at={8.4} text="stock listo" color={C.orange} size={130} top={400} />
        </AbsoluteFill>
      )}
      {between(f, S.d, S.d2) && (
        <AbsoluteFill>
          <Clip src="c_oficina.mp4" from={S.d} />
          <Dim />
          <Title at={S.d + 0.05} text="Lunes: ofreces" color={C.white} size={92} top={280} />
          <Lugares />
        </AbsoluteFill>
      )}
      {between(f, S.d2, S.e) && (
        <AbsoluteFill>
          <Clip src="c_gym.mp4" from={S.d2} />
          <Dim />
          <Title at={S.d2} text="Lunes: ofreces" color={C.white} size={92} top={280} />
          <Lugares />
        </AbsoluteFill>
      )}
      {between(f, S.e, S.f) && (
        <AbsoluteFill>
          <Still src="corte.jpg" from={S.e} to={S.f} z0={1.04} z1={1.2} origin="50% 55%" />
          <Dim o={0.5} />
          <Cuenta />
        </AbsoluteFill>
      )}
      {between(f, S.f, S.g) && (
        <AbsoluteFill>
          <Clip src="c_bandeja.mp4" from={S.f} startFrom={60} />
          <Dim o={0.5} />
          <Sin />
        </AbsoluteFill>
      )}
      {between(f, S.g, S.h) && (
        <AbsoluteFill>
          <Still src="stock.jpg" from={S.g} to={S.h} z0={1.15} z1={1.02} origin="40% 55%" />
          <Dim o={0.45} />
          <Caso />
        </AbsoluteFill>
      )}
      {between(f, S.h, S.i) && (
        <AbsoluteFill>
          <Clip src="v_pdf.mp4" from={S.h} fit="frame" />
          <Metodo />
        </AbsoluteFill>
      )}
      {f >= t(S.i) && (
        <AbsoluteFill>
          <Sequence from={t(S.i)} layout="none">
            <OffthreadVideo src={staticFile('v_mockup.mp4')} playbackRate={0.6} muted style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(28px) brightness(0.5)', transform: 'scale(1.15)' }} />
            {/* O topo do mockup traz a promessa "genera hasta US$1,500 al mes": fica fora do quadro. */}
            <div style={{ position: 'absolute', left: 0, top: 590, width: 1080, height: 900, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
              <OffthreadVideo src={staticFile('v_mockup.mp4')} playbackRate={0.6} muted style={{ position: 'absolute', left: 0, top: -180, width: 1080, height: 1080, objectFit: 'cover' }} />
            </div>
          </Sequence>
          <Oferta />
        </AbsoluteFill>
      )}
    </>
  );
};

const Sfx: React.FC<{ at: number; src: string; v: number }> = ({ at, src, v }) => (
  <Sequence from={Math.max(0, t(at))} layout="none">
    <Audio src={staticFile(src)} volume={v} />
  </Sequence>
);
const NO_MUSIC = Boolean((getInputProps() as { noMusic?: boolean }).noMusic);
const Music: React.FC = () => {
  const f = useCurrentFrame();
  if (NO_MUSIC) return null;
  const v = interpolate(f, [0, 4, DURATION - 30, DURATION], [0, 0.17, 0.17, 0], clamp);
  return <Audio src={staticFile('music.wav')} volume={() => v} />;
};
const CUTS = [S.a2, S.b, S.c, S.d, S.d2, S.e, S.f, S.g, S.h, S.i];

export const Var1: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Scenes />
    <Captions />
    <Music />
    <Sequence from={VO} layout="none">
      <Audio src={staticFile('vo.wav')} />
    </Sequence>
    <Sfx at={0} src="subdrop.mp3" v={0.5} />
    <Sfx at={0.05} src="hit_sub.mp3" v={0.35} />
    <Sfx at={3.94} src="boom_low.mp3" v={0.35} />
    <Sfx at={6.75} src="scribble.mp3" v={0.4} />
    <Sfx at={8.4} src="pop.mp3" v={0.35} />
    {[12.37, 13.47, 14.24].map((s) => <Sfx key={s} at={s} src="notif.mp3" v={0.25} />)}
    {[15.6, 16.95].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.35} />)}
    <Sfx at={17.5} src="register.mp3" v={0.4} />
    <Sfx at={18.8} src="hit_sub.mp3" v={0.3} />
    <Sfx at={20.9} src="register.mp3" v={0.3} />
    {[21.75, 22.66, 23.62].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.35} />)}
    <Sfx at={26.86} src="notif.mp3" v={0.3} />
    <Sfx at={27.4} src="hit_sub.mp3" v={0.35} />
    {[29.2, 29.95, 30.85].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={32.95} src="scribble.mp3" v={0.35} />
    <Sfx at={33.25} src="register.mp3" v={0.45} />
    <Sfx at={34.9} src="hit_sub.mp3" v={0.4} />
    {CUTS.map((s) => <Sfx key={`w${s}`} at={s - 0.1} src="whoosh.mp3" v={0.22} />)}
  </AbsoluteFill>
);
