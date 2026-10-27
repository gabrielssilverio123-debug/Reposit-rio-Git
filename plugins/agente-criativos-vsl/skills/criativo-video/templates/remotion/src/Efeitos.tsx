// Biblioteca de efeitos para criativos e VSLs (1080×1920, 30 fps).
// Cada efeito usa o frame LOCAL: coloque-o dentro de <Sequence from={...}> no momento certo.
// Catálogo, quando usar e SFX sugerido: references/efeitos.md.
// "Melhor tomada" e "Corta as pausas" são etapas de edição: scripts/takes.py e scripts/tighten.py.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

const { fontFamily: INTER } = loadInter('normal', { weights: ['500', '700', '800', '900'], subsets: ['latin'] });

// Troque pela paleta da marca (ficha brand-<produto>.md).
export const C = {
  bg: '#0b0614',
  card: '#151021',
  accent: '#7c3aed',
  accentLight: '#c4b5fd',
  pink: '#ec4899',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.62)',
  red: '#f43f5e',
  green: '#22c55e',
};

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.out(Easing.cubic);
export const pop = (f: number, start: number, fps: number, damping = 13) => spring({ frame: f - start, fps, config: { damping, stiffness: 200 } });
export const shake = (f: number, start: number, amp = 14, len = 10) => {
  const t = f - start;
  if (t < 0 || t > len) return '';
  const k = amp * (1 - t / len);
  return `translate(${Math.sin(t * 2.7) * k}px, ${Math.cos(t * 3.1) * k}px)`;
};

// ---------- 01. Gancho animado ----------
// Título do gancho que entra palavra por palavra com impacto; `highlight` recebe marca-texto na cor de destaque.
export const GanchoAnimado: React.FC<{ text: string; highlight?: string[]; top?: number; size?: number; every?: number }> = ({ text, highlight = [], top = 300, size = 104, every = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 22px', transform: shake(f, 0, 10) }}>
      {words.map((w, i) => {
        const s = pop(f, i * every, fps, 11);
        const hl = highlight.includes(w.replace(/[.,!?:]/g, ''));
        const mark = interpolate(f, [i * every + 4, i * every + 12], [0, 1], { ...clamp, easing: ease });
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: -2, color: C.white, textTransform: 'uppercase', transform: `translateY(${(1 - s) * 60}px) scale(${interpolate(s, [0, 1], [1.6, 1])})`, opacity: Math.min(1, s * 2), textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
            {hl && <span style={{ position: 'absolute', left: -8, right: -8, bottom: 6, height: '42%', background: C.accent, transform: `scaleX(${mark})`, transformOrigin: 'left', zIndex: -1, borderRadius: 6 }} />}
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- 02. Palavra que bate ----------
// Uma palavra sozinha que "bate" na tela (no beat ou na fala): escala, flash e tremida.
export const PalavraQueBate: React.FC<{ word: string; color?: string; size?: number; top?: number }> = ({ word, color = C.white, size = 230, top = 760 }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 4, 7], [3.2, 0.92, 1], { ...clamp, easing: ease });
  const blur = interpolate(f, [0, 4], [14, 0], clamp);
  const flash = interpolate(f, [0, 5], [0.55, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, 3, 22, 8) }}>
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: -6, lineHeight: 1, color, textTransform: 'uppercase', transform: `scale(${scale})`, filter: `blur(${blur}px)`, textShadow: '0 10px 50px rgba(0,0,0,0.7)' }}>
        {word}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 03. Legenda gigante ----------
// 1–2 palavras por vez, enormes, palavra ativa na cor de destaque. `words` em segundos relativos ao início da Sequence.
type Word = { word: string; start: number; end: number };
export const LegendaGigante: React.FC<{ words: Word[]; perChunk?: number; top?: number; size?: number }> = ({ words, perChunk = 2, top = 1180, size = 130 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const chunks: Word[][] = [];
  for (let i = 0; i < words.length; i += perChunk) chunks.push(words.slice(i, i + perChunk));
  const idx = chunks.findIndex((c, i) => t >= c[0].start && (i === chunks.length - 1 || t < chunks[i + 1][0].start));
  if (idx < 0) return null;
  const c = chunks[idx];
  if (t > c[c.length - 1].end + 0.6) return null;
  const s = pop(f, Math.round(c[0].start * fps), fps, 12);
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top, textAlign: 'center', transform: `scale(${interpolate(s, [0, 1], [0.7, 1])}) rotate(${idx % 2 ? 2 : -2}deg)` }}>
      {c.map((w, i) => (
        <span key={i} style={{ fontFamily: INTER, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: -3, textTransform: 'uppercase', color: t >= w.start ? C.accentLight : C.white, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', marginRight: 24 }}>
          {w.word.replace(/[.,]/g, '')}
        </span>
      ))}
    </div>
  );
};

// ---------- 04. Barra de comando ----------
// Barra de busca/prompt que digita o texto, "aperta Enter" e mostra o resultado.
export const BarraDeComando: React.FC<{ text: string; result?: string; top?: number; cps?: number; icon?: string }> = ({ text, result, top = 700, cps = 22, icon = '⌘' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = pop(f, 0, fps, 16);
  const typed = Math.min(text.length, Math.floor(Math.max(0, f - 6) * (cps / fps)));
  const done = 6 + Math.ceil(text.length * (fps / cps));
  const press = interpolate(f, [done + 4, done + 7, done + 10], [1, 0.95, 1], clamp);
  const res = pop(f, done + 10, fps, 15);
  const caret = Math.floor(f / 8) % 2 === 0 && f < done + 4;
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top, transform: `translateY(${(1 - inS) * 60}px) scale(${press})`, opacity: Math.min(1, inS * 1.5) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '30px 34px', borderRadius: 30, background: 'rgba(21,16,33,0.92)', border: `2px solid ${C.accent}`, boxShadow: `0 20px 80px rgba(124,58,237,0.45)`, fontFamily: INTER, color: C.white }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900 }}>{icon}</div>
        <div style={{ flex: 1, fontWeight: 600, fontSize: 42, minHeight: 52 }}>
          {text.slice(0, typed)}
          {caret && <span style={{ color: C.accentLight }}>|</span>}
        </div>
        <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', fontWeight: 700, fontSize: 24, opacity: f >= done ? 1 : 0.4 }}>↵</div>
      </div>
      {result && f >= done + 10 && (
        <div style={{ marginTop: 18, padding: '26px 32px', borderRadius: 26, background: C.white, color: C.bg, fontFamily: INTER, fontWeight: 700, fontSize: 36, lineHeight: 1.3, transform: `translateY(${(1 - res) * -30}px)`, opacity: Math.min(1, res * 1.5) }}>
          {result}
        </div>
      )}
    </div>
  );
};

// ---------- 06. Lista riscada ----------
// Itens que entram e são riscados um a um (erros, mitos, o que não funciona). `keep` = item final que fica com ✓.
export const ListaRiscada: React.FC<{ title?: string; items: string[]; strikeAt: number[]; keep?: string; keepAt?: number; top?: number }> = ({ title, items, strikeAt, keep, keepAt = 9999, top = 420 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top, fontFamily: INTER }}>
      {title && <div style={{ fontWeight: 900, fontSize: 64, color: C.white, marginBottom: 30, textTransform: 'uppercase', transform: `scale(${pop(f, 0, fps)})`, transformOrigin: 'left' }}>{title}</div>}
      {items.map((it, i) => {
        const enter = pop(f, 4 + i * 5, fps, 16);
        const strike = interpolate(f, [strikeAt[i], strikeAt[i] + 6], [0, 1], { ...clamp, easing: ease });
        return (
          <div key={it} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 22, margin: '18px 0', transform: `translateX(${(1 - enter) * -120}px)`, opacity: Math.min(1, enter * 1.5) * (strike > 0.9 ? 0.55 : 1) }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, border: `4px solid ${strike > 0 ? C.red : C.muted}`, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 38 }}>{strike > 0.5 ? '✕' : ''}</div>
            <div style={{ position: 'relative', fontWeight: 800, fontSize: 56, color: C.white }}>
              {it}
              <div style={{ position: 'absolute', left: -6, top: '52%', height: 9, width: `${strike * 104}%`, background: C.red, borderRadius: 4, transform: 'rotate(-2deg)' }} />
            </div>
          </div>
        );
      })}
      {keep && f >= keepAt && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 34, transform: `scale(${pop(f, keepAt, fps, 10)})`, transformOrigin: 'left' }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: C.green, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 38 }}>✓</div>
          <div style={{ fontWeight: 900, fontSize: 60, color: C.accentLight }}>{keep}</div>
        </div>
      )}
    </div>
  );
};

// ---------- 07. Solta o arquivo ----------
// Um arquivo (PDF, planilha, guia) cai na tela com quique e vira "entregue". Ótimo para mostrar entregáveis.
export const SoltaOArquivo: React.FC<{ name: string; ext?: string; caption?: string; cover?: React.ReactNode; top?: number }> = ({ name, ext = 'PDF', caption = 'Downloaded ✓', cover, top = 520 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: f, fps, config: { damping: 9, stiffness: 140, mass: 0.9 } });
  const y = interpolate(drop, [0, 1], [-1100, 0]);
  const tilt = interpolate(drop, [0, 1], [-18, 0]);
  const squash = interpolate(f, [9, 12, 16], [1, 0.9, 1], clamp);
  const cap = pop(f, 18, fps);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 420, height: 540, transform: `translateY(${y}px) rotate(${tilt}deg) scaleY(${squash})`, transformOrigin: 'bottom center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: C.white, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', clipPath: 'polygon(0 0, 78% 0, 100% 16%, 100% 100%, 0 100%)' }}>
          {cover ?? <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${C.accent}, ${C.bg})` }} />}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, width: 92, height: 86, background: '#e9e3f7', borderBottomLeftRadius: 18, clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
        <div style={{ position: 'absolute', left: 26, bottom: 26, padding: '8px 18px', borderRadius: 10, background: C.red, color: C.white, fontFamily: INTER, fontWeight: 900, fontSize: 32 }}>{ext}</div>
      </div>
      <div style={{ marginTop: 26, fontFamily: INTER, fontWeight: 800, fontSize: 44, color: C.white, opacity: Math.min(1, drop) }}>{name}</div>
      {f >= 18 && <div style={{ marginTop: 14, padding: '12px 26px', borderRadius: 999, background: C.green, color: C.white, fontFamily: INTER, fontWeight: 800, fontSize: 32, transform: `scale(${cap})` }}>{caption}</div>}
    </div>
  );
};

// ---------- 09. Carimbo ----------
export const Carimbo: React.FC<{ text: string; color?: string; rotate?: number; top?: number; left?: number; size?: number }> = ({ text, color = C.red, rotate = -12, top = 700, left, size = 120 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, 0, fps, 12);
  return (
    <div style={{ position: 'absolute', top, left: left ?? 0, right: left === undefined ? 0 : undefined, display: 'flex', justifyContent: 'center', transform: shake(f, 3, 16, 8) }}>
      <div style={{ padding: '10px 36px', border: `10px solid ${color}`, borderRadius: 22, color, fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: 6, textTransform: 'uppercase', background: 'rgba(0,0,0,0.25)', transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [2.4, 1])})`, opacity: Math.min(1, s * 1.6), maskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 100%)' }}>
        {text}
      </div>
    </div>
  );
};

// ---------- 10. Antes e depois ----------
// Cortina que revela o "depois" sobre o "antes", com divisória e rótulos.
export const AntesDepois: React.FC<{ before: React.ReactNode; after: React.ReactNode; revealAt?: number; dur?: number; labels?: [string, string] }> = ({ before, after, revealAt = 12, dur = 18, labels = ['BEFORE', 'AFTER'] }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [revealAt, revealAt + dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = p * 1080;
  const tag = (t: string, side: 'l' | 'r', bg: string) => (
    <div style={{ position: 'absolute', top: 250, [side === 'l' ? 'left' : 'right']: 50, padding: '12px 26px', borderRadius: 999, background: bg, fontFamily: INTER, fontWeight: 900, fontSize: 34, letterSpacing: 4, color: C.white }}>{t}</div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill>{before}</AbsoluteFill>
      {tag(labels[0], 'r', 'rgba(244,63,94,0.9)')}
      <AbsoluteFill style={{ clipPath: `inset(0 ${1080 - x}px 0 0)` }}>
        {after}
        {tag(labels[1], 'l', C.accent)}
      </AbsoluteFill>
      {p > 0 && p < 1 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: x - 4, width: 8, background: C.white, boxShadow: '0 0 30px rgba(255,255,255,0.8)' }}>
          <div style={{ position: 'absolute', top: 900, left: -38, width: 84, height: 84, borderRadius: 42, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: C.bg, fontFamily: INTER }}>⇆</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 11. Tela verde ----------
// Apresentador recortado (vídeo com transparência .webm — HeyGen outputFormat "webm" ou scripts/chroma.sh)
// sobre qualquer fundo: print, página, gráfico, produto. Ele fica ancorado embaixo, como "comentando" o fundo.
export const TelaVerde: React.FC<{ background: React.ReactNode; presenterSrc: string; startFrom?: number; height?: number; side?: 'left' | 'center' | 'right' }> = ({ background, presenterSrc, startFrom = 0, height = 1150, side = 'center' }) => {
  const width = Math.round((height * 9) / 16);
  const left = side === 'left' ? -60 : side === 'right' ? 1080 - width + 60 : (1080 - width) / 2;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{background}</AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <OffthreadVideo src={presenterSrc} startFrom={startFrom} transparent muted style={{ position: 'absolute', left, bottom: 0, width, height, objectFit: 'cover' }} />
    </AbsoluteFill>
  );
};

// ---------- 12. Zoom no rosto ----------
// Punch-in rápido no rosto para enfatizar uma frase (corte seco de 1× para `scale` em 3 frames).
export const ZoomNoRosto: React.FC<{ children: React.ReactNode; at: number; hold?: number; scale?: number; focus?: string }> = ({ children, at, hold = 30, scale = 1.35, focus = '50% 32%' }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [at, at + 3, at + hold, at + hold + 6], [1, scale, scale + 0.03, 1], clamp);
  return <AbsoluteFill style={{ transform: `scale(${z}) ${shake(f, at, 6, 6)}`, transformOrigin: focus }}>{children}</AbsoluteFill>;
};

// ---------- 13. Tela dividida ----------
export const TelaDividida: React.FC<{ top: React.ReactNode; bottom: React.ReactNode; ratio?: number }> = ({ top, bottom, ratio = 0.5 }) => {
  const h = Math.round(1920 * ratio);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: h, overflow: 'hidden' }}>{top}</div>
      <div style={{ position: 'absolute', left: 0, top: h, width: 1080, height: 1920 - h, overflow: 'hidden' }}>{bottom}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: h - 3, height: 6, background: `linear-gradient(90deg, ${C.accent}, ${C.pink})` }} />
    </AbsoluteFill>
  );
};

// ---------- 14. Notificação ----------
// Banner estilo celular descendo do topo (app genérico — nunca logo/UI de terceiros). Use várias com `delay` para empilhar.
export const Notificacao: React.FC<{ title: string; body: string; app?: string; delay?: number; index?: number; top?: number }> = ({ title, body, app = 'MESSAGES', delay = 0, index = 0, top = 240 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 220 } });
  if (f < delay) return null;
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top: top + index * 150, transform: `translateY(${(1 - s) * -220}px) scale(${0.94 + s * 0.06})`, opacity: Math.min(1, s * 1.4), display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 32, background: 'rgba(40,36,52,0.82)', backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)', fontFamily: INTER, color: C.white }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>💬</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 21, letterSpacing: 2, opacity: 0.6 }}>{app}</div>
        <div style={{ fontWeight: 800, fontSize: 32 }}>{title}</div>
        <div style={{ fontWeight: 500, fontSize: 29, opacity: 0.88 }}>{body}</div>
      </div>
      <div style={{ alignSelf: 'flex-start', fontWeight: 500, fontSize: 22, opacity: 0.55 }}>now</div>
    </div>
  );
};

// ---------- 15. Pede comentário ----------
// Balão de comentário sendo digitado + seta para o ícone de comentários (lateral direita do Reels).
export const PedeComentario: React.FC<{ keyword: string; prompt?: string; top?: number }> = ({ keyword, prompt = 'Comment', top = 1060 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, 0, fps, 12);
  const typed = Math.min(keyword.length, Math.floor(Math.max(0, f - 10) / 2));
  const arrow = Math.sin(f / 5) * 12;
  return (
    <>
      <div style={{ position: 'absolute', left: 70, right: 170, top, transform: `scale(${s})`, transformOrigin: 'left bottom' }}>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 58, color: C.white, textTransform: 'uppercase', marginBottom: 18, textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
          {prompt} <span style={{ color: C.accentLight }}>“{keyword}”</span> 👇
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', borderRadius: 28, background: C.white, boxShadow: '0 20px 60px rgba(0,0,0,0.45)', fontFamily: INTER }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: `linear-gradient(135deg, ${C.accent}, ${C.pink})` }} />
          <div style={{ flex: 1, fontWeight: 700, fontSize: 40, color: C.bg }}>
            {keyword.slice(0, typed)}
            {Math.floor(f / 8) % 2 === 0 && <span style={{ color: C.accent }}>|</span>}
          </div>
          <div style={{ fontSize: 40, opacity: typed === keyword.length ? 1 : 0.3 }}>➤</div>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 60, top: 1180 + arrow, fontSize: 90, color: C.white, opacity: Math.min(1, s), filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>➜</div>
    </>
  );
};

// ---------- Demo: todos os efeitos em sequência (composição "EfeitosDemo") ----------
const Card: React.FC<{ label: string; tone: string }> = ({ label, tone }) => (
  <AbsoluteFill style={{ background: tone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 900, fontSize: 90, color: 'rgba(255,255,255,0.85)' }}>{label}</AbsoluteFill>
);
const Label: React.FC<{ n: string; name: string }> = ({ n, name }) => (
  <div style={{ position: 'absolute', left: 50, top: 1560, padding: '10px 22px', borderRadius: 14, background: 'rgba(0,0,0,0.6)', fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.white }}>
    {n} · {name}
  </div>
);
export const DEMO_STEP = 75;
export const DEMO: { n: string; name: string; el: React.ReactNode }[] = [
  { n: '01', name: 'Gancho animado', el: <GanchoAnimado text="Your profile is killing your matches" highlight={['killing']} /> },
  { n: '02', name: 'Palavra que bate', el: <PalavraQueBate word="NOPE." color={C.red} /> },
  { n: '03', name: 'Legenda gigante', el: <LegendaGigante words={[{ word: 'It’s', start: 0.1, end: 0.3 }, { word: 'not', start: 0.35, end: 0.6 }, { word: 'you.', start: 0.7, end: 1.0 }, { word: 'It’s', start: 1.2, end: 1.4 }, { word: 'your', start: 1.45, end: 1.7 }, { word: 'profile.', start: 1.75, end: 2.3 }]} top={800} /> },
  { n: '04', name: 'Barra de comando', el: <BarraDeComando text="why do I get no matches?" result="Your first photo is too dark and your bio says nothing." /> },
  { n: '06', name: 'Lista riscada', el: <ListaRiscada title="What I tried" items={['Premium plan', 'More swipes', 'New city']} strikeAt={[18, 30, 42]} keep="Fixed my profile" keepAt={54} /> },
  { n: '07', name: 'Solta o arquivo', el: <SoltaOArquivo name="50 Magnetic Bios" /> },
  { n: '09', name: 'Carimbo', el: <Carimbo text="Approved" color={C.green} /> },
  { n: '10', name: 'Antes e depois', el: <AntesDepois before={<Card label="BEFORE" tone="#3b3346" />} after={<Card label="AFTER" tone={C.accent} />} /> },
  { n: '12', name: 'Zoom no rosto', el: <ZoomNoRosto at={20}><Card label="🙂" tone="#2a2238" /></ZoomNoRosto> },
  { n: '13', name: 'Tela dividida', el: <TelaDividida top={<Card label="TOP" tone="#2a2238" />} bottom={<Card label="BOTTOM" tone="#3b2a4a" />} /> },
  { n: '14', name: 'Notificação', el: <>{[0, 1, 2].map((i) => <Notificacao key={i} index={i} delay={i * 8} title="New match!" body="You have a new match 💜" />)}</> },
  { n: '15', name: 'Pede comentário', el: <PedeComentario keyword="SECRET" /> },
];
export const EfeitosDemo: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(1000px 1200px at 50% 30%, rgba(124,58,237,0.45), ${C.bg} 70%)` }}>
    {DEMO.map((d, i) => (
      <Sequence key={d.n} from={i * DEMO_STEP} durationInFrames={DEMO_STEP}>
        {d.el}
        <Label n={d.n} name={d.name} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
