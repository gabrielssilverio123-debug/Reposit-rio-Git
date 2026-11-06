// Criativo demonstrativo em tela dividida (renda extra), 9:16: preparo em cima, apresentadora com lip-sync embaixo.
import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import WORDS from '../public/words.json';
import { Bubble, C, Cmd, Cta, Ejemplo, INTER, makeCaptions, Music, pop, Precio, Sfx, Slam, t, Tag, Title, VO, Word } from './kit';

export const DURATION = 1065;
const SPLIT = 860; // linha da divisão: preparo em cima (0–860), apresentadora embaixo (860–1920)
const WA = '#25d366';
const Captions = makeCaptions(WORDS as Word[], 32.26, SPLIT - 70);

// Cortes da faixa de cima (fim de cada plano em assets/top_shots.py) e mudanças de seção.
const CUTS = [1.0, 1.96, 3.1, 4.12, 5.05, 6.03, 7.47, 9.51, 10.86, 12.46, 14.6, 16.17, 17.52, 19.12, 20.69, 22.8, 24.39, 25.86, 27.59];
const SECTIONS = [6.03, 9.51, 14.6, 19.12, 22.8, 27.59, 31.05];

// ---------- Metade de cima ----------
const Top: React.FC = () => {
  const f = useCurrentFrame();
  const last = [...CUTS].reverse().find((c) => f >= t(c)) ?? -1;
  const k = last < 0 ? 99 : f - t(last);
  const punch = interpolate(k, [0, 6], [1.09, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flash = SECTIONS.includes(last) ? interpolate(k, [0, 4], [0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: SPLIT, overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${punch})` }}>
        {f < t(27.59) && (
          <Sequence from={VO} layout="none">
            <OffthreadVideo src={staticFile('top.mp4')} muted style={{ position: 'absolute', left: 0, top: (SPLIT - 960) / 2, width: 1080, height: 960 }} />
          </Sequence>
        )}
        {f >= t(27.59) && (
          <Sequence from={t(27.59)} layout="none">
            <OffthreadVideo src={staticFile('v_mockup.mp4')} playbackRate={0.6} muted style={{ position: 'absolute', width: 1080, height: SPLIT, objectFit: 'cover', filter: 'blur(26px) brightness(0.5)', transform: 'scale(1.2)' }} />
            {/* O topo do mockup ("genera hasta US$1,500 al mes") fica fora do quadro. */}
            <OffthreadVideo src={staticFile('v_mockup.mp4')} playbackRate={0.6} muted style={{ position: 'absolute', left: 0, top: -180, width: 1080, height: 1080, objectFit: 'cover', opacity: f >= t(31.05) ? 1 : 0.35 }} />
          </Sequence>
        )}
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.5) 100%)' }} />
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </div>
  );
};

// ---------- Metade de baixo: apresentadora (o vídeo começa junto com a narração) ----------
const Bottom: React.FC = () => {
  const f = useCurrentFrame();
  // zoom no rosto nos momentos de impacto
  const zooms: [number, number, number][] = [[0, 4.12, 1.0], [4.12, 6.03, 1.14], [6.03, 22.8, 1.0], [22.8, 27.59, 1.07], [27.59, 31.05, 1.0], [31.05, 40, 1.1]];
  const z = zooms.find(([a, b]) => f >= t(a) && f < t(b)) ?? zooms[0];
  const zk = interpolate(f - t(z[0]), [0, 8], [z[2] === 1 ? 1.06 : 1, z[2]], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const drift = interpolate(f, [0, 1065], [1, 1.04]);
  return (
    <div style={{ position: 'absolute', left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, overflow: 'hidden', background: '#000' }}>
      <Sequence from={VO} layout="none">
        <OffthreadVideo src={staticFile('pres.mp4')} muted style={{ position: 'absolute', left: 0, top: -230, width: 1080, height: 1920, transform: `scale(${zk * drift})`, transformOrigin: '50% 30%' }} />
      </Sequence>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.35) 100%)' }} />
    </div>
  );
};
const Divider: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, top: SPLIT - 4, width: 1080, height: 8, background: C.orange, boxShadow: '0 0 24px rgba(255,138,0,0.8)' }} />
);

// ---------- Gancho: chuva de notificações de venda ----------
const SALES = [
  { at: 0.12, body: '+US$2,50 · 1 barrita' },
  { at: 0.75, body: '+US$5,00 · 2 barritas' },
  { at: 1.35, body: '+US$7,50 · 3 barritas' },
  { at: 1.96, body: '+US$5,00 · 2 barritas' },
  { at: 2.6, body: '+US$12,50 · 5 barritas' },
  { at: 3.25, body: '+US$7,50 · 3 barritas' },
  { at: 3.85, body: '+US$10,00 · 4 barritas' },
];
const VentaCard: React.FC<{ at: number; body: string; slot: number }> = ({ at, body, slot }) => {
  const f = useCurrentFrame();
  const s = pop(f, t(at), 14);
  return (
    <div style={{ position: 'absolute', left: 40, width: 640, top: 236 + slot * 118, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderRadius: 26, background: 'rgba(255,255,255,0.96)', boxShadow: '0 14px 40px rgba(0,0,0,0.45)', fontFamily: INTER, transform: `translateX(${(1 - s) * -720}px)`, opacity: slot === 1 ? 0.75 : 1 }}>
      <div style={{ width: 64, height: 64, flex: '0 0 64px', borderRadius: 16, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>💰</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 30, color: C.green }}>¡Nueva venta! · ahora</div>
        <div style={{ fontWeight: 900, fontSize: 38, color: C.ink }}>{body}</div>
      </div>
    </div>
  );
};
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= t(6.03)) return null;
  const shown = SALES.filter((s) => f >= t(s.at)).slice(-2).reverse();
  return (
    <>
      {f < t(4.12) && shown.map((s, i) => <VentaCard key={s.at} at={s.at} body={s.body} slot={i} />)}
      {f < t(4.12) && f >= t(0.12) && (
        <div style={{ position: 'absolute', left: 40, top: 236 + 2 * 118 - 4 }}>
          <Tag text="Simulación" bg="rgba(255,246,232,0.9)" style={{ fontSize: 22, padding: '6px 16px' }} />
        </div>
      )}
      <Slam at={0.92} until={2.2} text="24 HORAS" color={C.yellow} size={150} top={540} />
      <Slam at={2.2} until={4.12} text="US$4.000" color={C.green} size={170} top={530} />
      {f >= t(2.3) && f < t(4.12) && <Ejemplo at={2.3} top={720} />}
      <Title at={4.12} until={5.05} text="¿Parece mentira? 🤨" color={C.white} size={96} top={420} />
      <Title at={5.05} text="Mira cómo funciona 👇" color={C.yellow} size={90} top={420} />
    </>
  );
};

// ---------- Seções ----------
const Chat: React.FC = () => {
  const f = useCurrentFrame();
  if (f < t(6.03) || f >= t(9.51)) return null;
  const msgs = [
    { at: 6.8, txt: '¿Tienes barritas hoy? 😋' },
    { at: 7.47, txt: '¡Yo quiero 2!' },
    { at: 8.15, txt: '¿Me apartas 3? 🙏' },
    { at: 8.73, txt: '¡Quiero para mi oficina!' },
  ].filter((m) => f >= t(m.at));
  return (
    <>
      <div style={{ position: 'absolute', left: 50, right: 130, top: 236, textAlign: 'center', transform: `scale(${pop(f, t(6.03))})` }}>
        <Tag text="💬 Ventas por WhatsApp" bg={WA} color={C.white} style={{ fontSize: 50, padding: '14px 32px' }} />
      </div>
      <div style={{ position: 'absolute', left: 44, width: 760, top: 350, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.slice(-3).map((m) => (
          <div key={m.at} style={{ display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${pop(f, t(m.at), 12)})`, transformOrigin: 'left center' }}>
            <div style={{ width: 54, height: 54, flex: '0 0 54px', borderRadius: 27, background: WA, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🟢</div>
            <div style={{ padding: '14px 22px', borderRadius: 24, borderTopLeftRadius: 6, background: C.white, fontFamily: INTER, fontWeight: 800, fontSize: 38, color: C.ink, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>{m.txt}</div>
          </div>
        ))}
      </div>
    </>
  );
};
const Chips: React.FC<{ items: { t: string; at: number; bg?: string; color?: string }[]; top: number }> = ({ items, top }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 50, right: 130, top, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
      {items.map((c) => (f >= t(c.at) ? <Tag key={c.t} text={c.t} bg={c.bg} color={c.color} style={{ fontSize: 46, transform: `scale(${interpolate(pop(f, t(c.at), 10), [0, 1], [1.6, 1])})` }} /> : null))}
    </div>
  );
};
const Sections: React.FC = () => {
  const f = useCurrentFrame();
  const in_ = (a: number, b: number) => f >= t(a) && f < t(b);
  return (
    <>
      <Chat />
      {in_(9.51, 14.6) && (
        <>
          <Title at={9.51} text="Clientes listos" color={C.white} size={86} top={236} />
          <Chips top={360} items={[{ t: '🏠 Vecinos', at: 9.51 }, { t: '💼 Trabajo', at: 10.86 }, { t: '👥 Grupos del barrio', at: 11.47 }]} />
          <Slam at={13.67} until={14.6} text="TODOS LOS DÍAS" color={C.yellow} size={104} top={560} flash={false} />
        </>
      )}
      {in_(14.6, 19.12) && (
        <>
          <Title at={14.6} text="El nicho que más paga" color={C.white} size={64} top={240} />
          <Chips top={360} items={[{ t: 'Keto', at: 15.63 }, { t: 'Proteicas', at: 16.17 }, { t: '+ Margen 💰', at: 18.34, bg: C.green, color: C.white }]} />
        </>
      )}
      {in_(19.12, 22.8) && (
        <>
          <Title at={19.12} text="Máxima eficiencia" color={C.white} size={84} top={236} />
          <Slam at={19.83} until={22.8} text="⏰ 1 MAÑANA" color={C.yellow} size={130} top={380} flash={false} />
          <Title at={21.22} text="= stock de la semana" color={C.white} size={74} top={560} />
        </>
      )}
      {in_(22.8, 27.59) && (
        <>
          <Title at={22.8} text="Caso real" color={C.white} size={66} top={236} />
          <Title at={23.54} text="Eugenia" color={C.orange} size={116} top={306} />
          {f >= t(24.39) && (
            <div style={{ position: 'absolute', left: 50, right: 130, top: 470, textAlign: 'center', transform: `scale(${pop(f, t(24.39))})` }}>
              <Tag text="1 bandeja de prueba →" style={{ fontSize: 48 }} />
            </div>
          )}
          <Slam at={25.86} until={27.59} text="3 PUNTOS FIJOS" color={C.yellow} size={110} top={580} />
        </>
      )}
      {in_(27.59, 31.05) && (
        <>
          <Cmd at={27.59} text="escribiendo tu mensaje" top={240} />
          <div style={{ position: 'absolute', left: 44, right: 130, top: 400, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bubble at={28.52} text="💬 «¡Hola! Hoy tengo barritas caseras 🍫 ¿Te aparto 2?»" />
            <Bubble at={29.66} text="💰 Tu precio y tu ganancia, calculados ✅" />
          </div>
          <Ejemplo at={28.52} top={650} text="Simulación de ejemplo" />
        </>
      )}
      {f >= t(31.05) && (
        <>
          <Precio strikeAt={31.33} priceAt={31.48} top={236} />
          <Cta at={32.26} text="DESCUBRE EL MÉTODO" top={620} />
        </>
      )}
    </>
  );
};

export const Split: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontFamily: INTER }}>
    <Top />
    <Bottom />
    <Divider />
    <Hook />
    <Sections />
    <Captions />
    <Music src="music.wav" duration={DURATION} v={0.16} />
    <Sequence from={VO} layout="none">
      <Audio src={staticFile('vo.wav')} />
    </Sequence>
    <Sfx at={0} src="subdrop.mp3" v={0.5} />
    {SALES.map((s, i) => <Sfx key={`s${i}`} at={s.at} src={i % 2 === 0 ? 'register.mp3' : 'notif.mp3'} v={i % 2 === 0 ? 0.32 : 0.24} />)}
    <Sfx at={0.92} src="hit_sub.mp3" v={0.4} />
    <Sfx at={2.2} src="boom_low.mp3" v={0.42} />
    <Sfx at={4.12} src="pop.mp3" v={0.3} />
    {[6.8, 7.47, 8.15, 8.73].map((s) => <Sfx key={`m${s}`} at={s} src="notif.mp3" v={0.26} />)}
    {[9.51, 10.86, 11.47, 15.63, 16.17].map((s) => <Sfx key={`p${s}`} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={13.67} src="hit_sub.mp3" v={0.3} />
    <Sfx at={18.34} src="register.mp3" v={0.35} />
    <Sfx at={19.83} src="hit_sub.mp3" v={0.32} />
    <Sfx at={24.39} src="pop.mp3" v={0.3} />
    <Sfx at={25.86} src="boom_low.mp3" v={0.38} />
    <Sfx at={27.59} src="notif.mp3" v={0.25} />
    {[28.52, 29.66].map((s) => <Sfx key={`b${s}`} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={31.33} src="scribble.mp3" v={0.35} />
    <Sfx at={31.48} src="register.mp3" v={0.45} />
    <Sfx at={32.26} src="hit_sub.mp3" v={0.42} />
    {CUTS.map((s) => <Sfx key={`w${s}`} at={s - 0.08} src="whoosh.mp3" v={SECTIONS.includes(s) ? 0.26 : 0.13} />)}
    <Sfx at={31.05 - 0.08} src="whoosh.mp3" v={0.26} />
  </AbsoluteFill>
);
