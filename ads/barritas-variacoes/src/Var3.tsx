// Variação 3 de Barritas Que Venden: "Lo que dicen ellas" (provas sociais reais), 9:16, 31 s.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import WORDS from '../public/words3.json';
import { between, Bubble, C, Clip, Cmd, Counter, Cta, Dim, DimLow, Ejemplo, Framed, INTER, makeCaptions, Mockup, Music, Notif, outline, pop, Precio, Pres, Sfx, Slam, Still, t, Tag, Title, VO, Word } from './kit';

export const DURATION = 930;
const Captions = makeCaptions(WORDS as Word[], 26.5);
const S = { a: 0, b: 3.92, b2: 4.9, c: 5.73, d: 8.21, e: 10.22, f: 13.79, g: 14.78, g2: 15.48, g3: 16.12, g4: 16.89, h: 17.66, i: 19.48, j: 23.95, k: 26.5 };

const Estrellas: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 50, right: 130, top: 290, textAlign: 'center' }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const at = t(S.e) + i * 3;
        if (f < at) return null;
        return <span key={i} style={{ display: 'inline-block', fontSize: 110, color: C.yellow, textShadow: outline, transform: `scale(${pop(f, at, 9)})` }}>★</span>;
      })}
    </div>
  );
};
const Pasos: React.FC = () => {
  const f = useCurrentFrame();
  const steps = [
    { n: '1', t: 'Prepara', at: S.g },
    { n: '2', t: 'Calcula', at: S.g2 },
    { n: '3', t: 'Presenta', at: S.g3 },
    { n: '4', t: 'Ofrece', at: S.g4 },
  ];
  return (
    <div style={{ position: 'absolute', left: 60, top: 330, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {steps.map((s, i) => {
        if (f < t(s.at)) return null;
        const cur = i === steps.length - 1 || f < t(steps[i + 1].at);
        const k = pop(f, t(s.at), 10);
        return (
          <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${(cur ? 1.08 : 0.92) * k})`, transformOrigin: 'left center', opacity: cur ? 1 : 0.8 }}>
            <div style={{ width: 100, height: 100, borderRadius: 26, background: cur ? C.orange : C.green, color: C.white, fontFamily: INTER, fontWeight: 900, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cur ? s.n : '✓'}</div>
            <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 96, color: cur ? C.yellow : C.white, textShadow: outline, textTransform: 'uppercase' }}>{s.t}</span>
          </div>
        );
      })}
    </div>
  );
};
const Robot: React.FC = () => {
  const f = useCurrentFrame();
  const s = pop(f, t(17.85), 10);
  const bob = Math.sin(f / 8) * 10;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 42%, #ffb347 0%, #ff8a00 35%, #3a1d00 100%)' }}>
      <Img src={staticFile('asesor.png')} style={{ position: 'absolute', left: 270, top: 420 + bob, width: 480, height: 533, objectFit: 'contain', transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`, filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.5))' }} />
    </AbsoluteFill>
  );
};

const Scenes: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {between(f, S.a, S.b) && (
        <AbsoluteFill>
          <Pres src="pres3.mp4" from={S.a} to={S.b} z0={1} z1={1.08} />
          <DimLow />
          <Title at={0.44} until={2.51} text="¿Barritas caseras? 🙄" color={C.white} size={96} top={980} />
          <Title at={2.51} text="Mira lo que dicen ellas 👀" color={C.yellow} size={84} top={980} />
        </AbsoluteFill>
      )}
      {between(f, S.b, S.b2) && (
        <AbsoluteFill>
          <Framed src="carol1.jpg" from={S.b} to={S.b2} top={430} w={700} />
          <Notif at={S.b} icon="💬" title="Carol Díaz Barrientos" body="«Aquí se venden muchas.»" top={230} />
        </AbsoluteFill>
      )}
      {between(f, S.b2, S.c) && (
        <AbsoluteFill>
          <Framed src="carol2.jpg" from={S.b2} to={S.c} top={430} w={700} />
          <Notif at={S.b} icon="💬" title="Carol Díaz Barrientos" body="«Aquí se venden muchas.»" top={230} />
          {f >= t(5.0) && (
            <div style={{ position: 'absolute', left: 50, right: 130, top: 1110, textAlign: 'center', transform: `scale(${pop(f, t(5.0))})` }}>
              <Tag text="Tanda empacada y lista ✓" style={{ fontSize: 44 }} />
            </div>
          )}
        </AbsoluteFill>
      )}
      {between(f, S.c, S.d) && (
        <AbsoluteFill>
          <Clip src="c_bandeja.mp4" from={S.c} />
          <Dim />
          <Title at={S.c} text="Caso real" color={C.white} size={70} top={260} />
          <Title at={S.c + 0.1} text="Eugenia" color={C.orange} size={120} top={340} />
          {f >= t(6.95) && (
            <div style={{ position: 'absolute', left: 50, right: 130, top: 560, textAlign: 'center', transform: `scale(${pop(f, t(6.95))})` }}>
              <Tag text="1 bandeja de prueba" style={{ fontSize: 54 }} />
            </div>
          )}
        </AbsoluteFill>
      )}
      {between(f, S.d, S.e) && (
        <AbsoluteFill>
          <Still src="stock.jpg" from={S.d} to={S.e} z0={1.15} z1={1.03} origin="45% 55%" />
          <Dim o={0.45} />
          <Title at={S.d} text="Hoy:" color={C.white} size={100} top={420} />
          <Slam at={8.66} until={S.e} text={'3 PUNTOS\nFIJOS'} color={C.yellow} size={150} top={580} />
        </AbsoluteFill>
      )}
      {between(f, S.e, S.f) && (
        <AbsoluteFill>
          <Clip src="v_choco.mp4" from={S.e} z={1.05} />
          <Dim o={0.55} />
          <Estrellas />
          <Title at={10.41} text="4,9/5" color={C.white} size={110} top={430} />
          <Counter from={10.81} to={11.96} value={9500} prefix="+" size={200} top={590} />
          <Title at={12.55} text="ya empezaron" color={C.orange} size={100} top={820} />
        </AbsoluteFill>
      )}
      {between(f, S.f, S.g) && (
        <AbsoluteFill>
          <Pres src="pres3.mp4" from={S.f} to={S.g} z0={1.22} z1={1.3} origin="50% 26%" />
          <DimLow />
          <Title at={S.f} text="¿El secreto?" color={C.yellow} size={120} top={1040} />
        </AbsoluteFill>
      )}
      {between(f, S.g, S.g2) && (
        <AbsoluteFill>
          <Still src="mezcla.jpg" from={S.g} to={S.g2} z0={1.15} z1={1.05} />
        </AbsoluteFill>
      )}
      {between(f, S.g2, S.g3) && (
        <AbsoluteFill>
          <Still src="corte.jpg" from={S.g2} to={S.g3} z0={1.05} z1={1.15} />
        </AbsoluteFill>
      )}
      {between(f, S.g3, S.g4) && (
        <AbsoluteFill>
          <Clip src="v_choco.mp4" from={S.g3} startFrom={45} z={1.1} />
        </AbsoluteFill>
      )}
      {between(f, S.g4, S.h) && (
        <AbsoluteFill>
          <Clip src="c_oficina.mp4" from={S.g4} />
        </AbsoluteFill>
      )}
      {between(f, S.g, S.h) && (
        <AbsoluteFill>
          <Dim o={0.45} />
          <Pasos />
        </AbsoluteFill>
      )}
      {between(f, S.h, S.i) && (
        <AbsoluteFill>
          <Robot />
          <Title at={18.03} text="Tu Asesor IA" color={C.white} size={110} top={260} />
          <Title at={18.92} text="hace lo pesado 💪" color={C.yellow} size={92} top={1010} />
        </AbsoluteFill>
      )}
      {between(f, S.i, S.j) && (
        <AbsoluteFill>
          <Still src="celular.jpg" from={S.i} to={S.j} z0={1.04} z1={1.14} origin="50% 40%" />
          <Dim o={0.45} />
          <Cmd at={S.i} text="en línea 24/7" top={230} />
          <div style={{ position: 'absolute', left: 44, right: 130, top: 820, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bubble at={20.18} text="¿Cuánto cobro por barrita?" me />
            <Bubble at={20.89} text="Te cuesta US$1 → véndela a US$2,50. Ganas US$1,50 c/u ✅" />
            <Bubble at={21.7} text="💬 Mensaje listo: «¡Hola! Hoy tengo barritas caseras 🍫 ¿Te aparto 2?»" />
          </div>
          <Ejemplo at={20.18} top={762} text="Simulación de ejemplo" />
        </AbsoluteFill>
      )}
      {between(f, S.j, S.k) && (
        <AbsoluteFill>
          <Mockup from={S.j} />
          <Precio strikeAt={24.02} priceAt={24.21} tagAt={25.1} tag="Garantía de 7 días ✓" />
        </AbsoluteFill>
      )}
      {f >= t(S.k) && (
        <AbsoluteFill>
          <Pres src="pres3.mp4" from={S.k} to={31} z0={1} z1={1.05} />
          <DimLow />
          <Precio strikeAt={S.k} priceAt={S.k} tag="Garantía de 7 días ✓" top={950} compact />
          <Cta at={S.k} text="SÉ LA PRÓXIMA" />
        </AbsoluteFill>
      )}
    </>
  );
};

const CUTS = [S.b, S.b2, S.c, S.d, S.e, S.f, S.g, S.g2, S.g3, S.g4, S.h, S.i, S.j, S.k];

export const Var3: React.FC = () => (
  <AbsoluteFill style={{ background: '#000', fontFamily: INTER }}>
    <Scenes />
    <Captions />
    <Music src="music3.wav" duration={DURATION} />
    <Sequence from={VO} layout="none">
      <Audio src={staticFile('vo3.wav')} />
    </Sequence>
    <Sfx at={0} src="subdrop.mp3" v={0.5} />
    <Sfx at={0.44} src="hit_sub.mp3" v={0.35} />
    <Sfx at={2.51} src="pop.mp3" v={0.3} />
    <Sfx at={S.b} src="notif.mp3" v={0.32} />
    <Sfx at={5.0} src="pop.mp3" v={0.3} />
    <Sfx at={6.95} src="pop.mp3" v={0.3} />
    <Sfx at={8.66} src="boom_low.mp3" v={0.4} />
    {[0, 1, 2, 3, 4].map((i) => <Sfx key={`s${i}`} at={S.e + i * 0.1} src="pop.mp3" v={0.22} />)}
    <Sfx at={10.81} src="scribble.mp3" v={0.3} />
    <Sfx at={11.96} src="register.mp3" v={0.4} />
    <Sfx at={S.f} src="hit_sub.mp3" v={0.3} />
    {[S.g, S.g2, S.g3, S.g4].map((s) => <Sfx key={`p${s}`} at={s} src="pop.mp3" v={0.35} />)}
    <Sfx at={17.85} src="boom_low.mp3" v={0.35} />
    <Sfx at={S.i} src="notif.mp3" v={0.25} />
    {[20.18, 20.89, 21.7].map((s) => <Sfx key={`b${s}`} at={s} src="pop.mp3" v={0.3} />)}
    <Sfx at={24.02} src="scribble.mp3" v={0.35} />
    <Sfx at={24.21} src="register.mp3" v={0.45} />
    <Sfx at={25.1} src="notif.mp3" v={0.28} />
    <Sfx at={S.k} src="hit_sub.mp3" v={0.4} />
    {CUTS.map((s) => <Sfx key={`w${s}`} at={s - 0.1} src="whoosh.mp3" v={0.2} />)}
  </AbsoluteFill>
);
