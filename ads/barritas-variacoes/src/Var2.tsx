// Variação 2 de Barritas Que Venden: "La meta de US$4.000" (a conta transparente), 9:16, 35 s.
import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import WORDS from '../public/words2.json';
import { between, Bubble, C, Clip, Cmd, Counter, Cta, Dim, DimLow, Ejemplo, INTER, makeCaptions, Mockup, Music, Notif, pop, Precio, Pres, Sfx, shake, Slam, Still, t, Tag, Title, VO, Word } from './kit';

export const DURATION = 1050;
const Captions = makeCaptions(WORDS as Word[], 32.29);
const S = { a: 0, b: 3.22, c: 7.96, d: 9.86, e: 10.82, f: 12.94, h: 18.35, i: 20.74, j: 22.77, k: 24.11, l: 29.53, m: 32.29 };

// Tela dividida em 3 pontos fixos, cada um com «15/día».
const Split: React.FC = () => {
  const f = useCurrentFrame();
  const panels = [
    { at: S.f, label: '🏋️ Gimnasio', badge: 16.22, node: <Clip src="c_gym.mp4" from={S.f} /> },
    { at: 14.23, label: '💼 Oficina', badge: 16.42, node: <Clip src="c_oficina.mp4" from={14.23} /> },
    { at: 14.9, label: '🏪 Tienda', badge: 16.62, node: <Img src={staticFile('tienda.jpg')} style={{ position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${interpolate(f, [t(14.9), t(18.35)], [1.05, 1.15])})` }} /> },
  ];
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      {panels.map((p, i) => {
        if (f < t(p.at)) return null;
        const s = pop(f, t(p.at), 14);
        const b = f >= t(p.badge) ? pop(f, t(p.badge), 9) : 0;
        return (
          <div key={p.label} style={{ position: 'absolute', left: 0, top: i * 640, width: 1080, height: 640, overflow: 'hidden', borderBottom: i < 2 ? '6px solid #000' : 'none', transform: `translateX(${(1 - s) * 1080}px)` }}>
            <div style={{ position: 'absolute', left: 0, top: -640, width: 1080, height: 1920 }}>{p.node}</div>
            <AbsoluteFill style={{ background: 'rgba(0,0,0,0.22)' }} />
            <div style={{ position: 'absolute', left: 36, top: [250, 40, 110][i] }}>
              <Tag text={p.label} bg={C.white} style={{ fontSize: 48 }} />
            </div>
            {b > 0 && (
              <div style={{ position: 'absolute', left: i === 2 ? 560 : 540, top: [400, 330, 95][i], transform: `scale(${interpolate(b, [0, 1], [2, 1])}) rotate(-4deg)` }}>
                <Tag text="15/día" bg={C.yellow} style={{ fontSize: 84, padding: '14px 34px' }} />
              </div>
            )}
          </div>
        );
      })}
      <Ejemplo at={16.8} top={540} />
    </AbsoluteFill>
  );
};

const Scenes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {between(f, S.a, S.b) && (
        <AbsoluteFill>
          <Pres src="pres2.mp4" from={S.a} to={S.b} z0={1} z1={1.08} />
          <DimLow />
          <Title at={0} until={1.82} text="¿Cuántas barritas…" color={C.white} size={96} top={960} />
          <Slam at={1.82} until={S.b} text={'US$4.000\n/MES'} color={C.yellow} size={150} top={920} />
        </AbsoluteFill>
      )}
      {between(f, S.b, S.c) && (
        <AbsoluteFill>
          <Still src="corte.jpg" from={S.b} to={S.c} z0={1.04} z1={1.18} origin="50% 55%" />
          <Dim o={0.5} />
          <Cmd at={S.b} text="haciendo la cuenta" top={250} />
          <Title at={4.47} text="Línea premium" color={C.white} size={84} top={450} />
          <Title at={5.41} text="cada barrita te deja" color={C.cream} size={64} top={570} />
          <Slam at={6.96} until={S.c} text="+US$3" color={C.yellow} size={230} top={660} />
          <Ejemplo at={7.05} top={910} />
        </AbsoluteFill>
      )}
      {between(f, S.c, S.d) && (
        <AbsoluteFill>
          <Still src="stock.jpg" from={S.c} to={S.d} z0={1.15} z1={1.04} origin="45% 55%" />
          <Dim o={0.55} />
          <Title at={S.c} text="US$4.000 ÷ US$3 =" color={C.white} size={80} top={330} />
          <Counter from={8.3} to={9.35} value={1333} size={210} top={470} />
          <Title at={9.32} text="barritas al mes" color={C.orange} size={88} top={700} />
          <Ejemplo at={9.4} top={830} />
        </AbsoluteFill>
      )}
      {between(f, S.d, S.e) && (
        <AbsoluteFill style={{ transform: shake(f, t(S.d), 18) }}>
          <Pres src="pres2.mp4" from={S.d} to={S.e} z0={1.28} z1={1.36} origin="50% 26%" />
          <DimLow />
          <Title at={10.19} text="¿Mucho? 😳" color={C.yellow} size={120} top={1040} />
        </AbsoluteFill>
      )}
      {between(f, S.e, S.f) && (
        <AbsoluteFill>
          <Still src="mezcla.jpg" from={S.e} to={S.f} z0={1.12} z1={1.02} origin="40% 60%" />
          <Dim o={0.5} />
          <Title at={S.e} text="Pero divídelo" color={C.white} size={100} top={330} />
          <Slam at={11.84} until={S.f} text="÷ 3" color={C.orange} size={280} top={520} />
          <Title at={12.39} text="puntos fijos" color={C.yellow} size={100} top={860} />
        </AbsoluteFill>
      )}
      {between(f, S.f, S.h) && <Split />}
      {between(f, S.h, S.i) && (
        <AbsoluteFill>
          <Clip src="c_bandeja.mp4" from={S.h} />
          <Dim />
          <Title at={S.h} text="Caso real" color={C.white} size={70} top={260} />
          <Title at={18.68} text="Eugenia" color={C.orange} size={120} top={340} />
          {f >= t(19.86) && (
            <div style={{ position: 'absolute', left: 50, right: 130, top: 560, textAlign: 'center', transform: `scale(${pop(f, t(19.86))})` }}>
              <Tag text="1 bandeja de prueba" style={{ fontSize: 54 }} />
            </div>
          )}
        </AbsoluteFill>
      )}
      {between(f, S.i, S.j) && (
        <AbsoluteFill>
          <Still src="stock.jpg" from={S.i} to={S.j} z0={1.04} z1={1.16} origin="50% 50%" />
          <Dim o={0.45} />
          <Notif at={S.i} icon="🏪" title="Eugenia · hoy" body="3 puntos de venta fijos" top={300} />
          <Slam at={21.33} until={S.j} text={'3 PUNTOS\nFIJOS'} color={C.yellow} size={140} top={640} />
        </AbsoluteFill>
      )}
      {between(f, S.j, S.k) && (
        <AbsoluteFill>
          <Pres src="pres2.mp4" from={S.j} to={S.k} z0={1.05} z1={1.12} />
          <DimLow />
          <Title at={22.92} text="¡No lo haces sola!" color={C.white} size={88} top={1020} />
        </AbsoluteFill>
      )}
      {between(f, S.k, S.l) && (
        <AbsoluteFill>
          <Still src="celular.jpg" from={S.k} to={S.l} z0={1.04} z1={1.14} origin="50% 40%" />
          <Dim o={0.45} />
          <Cmd at={S.k} text="trabajando para ti" top={230} />
          <div style={{ position: 'absolute', left: 44, right: 130, top: 820, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bubble at={24.85} text="💰 Precio: US$5 · ganas ~US$3" />
            <Bubble at={26.11} text="📋 Producción: 45 barritas/día, lista" />
            <Bubble at={27.91} text="💬 «¡Hola! Hoy tengo barritas proteicas 🍫 ¿Te aparto 2?»" />
          </div>
          <Ejemplo at={24.85} top={762} text="Simulación de ejemplo" />
        </AbsoluteFill>
      )}
      {between(f, S.l, S.m) && (
        <AbsoluteFill>
          <Mockup from={S.l} />
          <Precio strikeAt={30.63} priceAt={31.11} />
        </AbsoluteFill>
      )}
      {f >= t(S.m) && (
        <AbsoluteFill>
          <Pres src="pres2.mp4" from={S.m} to={35.2} z0={1} z1={1.05} />
          <DimLow />
          <Precio strikeAt={S.m} priceAt={S.m} top={950} compact />
          <Cta at={S.m} text="ARMA TU META" />
        </AbsoluteFill>
      )}
    </>
  );
};

const CUTS = [S.b, S.c, S.d, S.e, S.f, S.h, S.i, S.j, S.k, S.l, S.m];

export const Var2: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontFamily: INTER }}>
    <Scenes />
    <Captions />
    <Music src="music2.wav" duration={DURATION} />
    <Sequence from={VO} layout="none">
      <Audio src={staticFile('vo2.wav')} />
    </Sequence>
    <Sfx at={0} src="subdrop.mp3" v={0.5} />
    <Sfx at={0.05} src="hit_sub.mp3" v={0.35} />
    <Sfx at={1.82} src="boom_low.mp3" v={0.4} />
    <Sfx at={3.3} src="notif.mp3" v={0.25} />
    {[4.47, 5.41].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={6.96} src="register.mp3" v={0.45} />
    <Sfx at={8.3} src="scribble.mp3" v={0.3} />
    <Sfx at={9.35} src="hit_sub.mp3" v={0.35} />
    <Sfx at={10.19} src="pop.mp3" v={0.35} />
    <Sfx at={11.84} src="boom_low.mp3" v={0.35} />
    {[13.2, 14.23, 14.9].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.35} />)}
    {[16.22, 16.42, 16.62].map((s) => <Sfx key={s} at={s} src="notif.mp3" v={0.22} />)}
    {[18.68, 19.86].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={20.74} src="notif.mp3" v={0.3} />
    <Sfx at={21.33} src="hit_sub.mp3" v={0.35} />
    <Sfx at={22.92} src="pop.mp3" v={0.3} />
    <Sfx at={24.11} src="notif.mp3" v={0.25} />
    {[24.85, 26.11, 27.91].map((s) => <Sfx key={s} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={30.63} src="scribble.mp3" v={0.35} />
    <Sfx at={31.11} src="register.mp3" v={0.45} />
    <Sfx at={S.m} src="hit_sub.mp3" v={0.4} />
    {CUTS.map((s) => <Sfx key={`w${s}`} at={s - 0.1} src="whoosh.mp3" v={0.22} />)}
  </AbsoluteFill>
);
