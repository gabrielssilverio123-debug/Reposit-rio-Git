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

const { fontFamily: INTER } = loadInter('normal', { weights: ['500', '700', '800', '900'], subsets: ['latin'] });
const { fontFamily: SERIF } = loadSerif('italic', { weights: ['400'], subsets: ['latin'] });

// Brand palette taken from the landing page (dark + violet).
const C = {
  bg: '#0b0614',
  violet: '#7c3aed',
  violetLight: '#c4b5fd',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.62)',
};

// Timeline (30 fps). Word onsets measured on the voiceover (public/vo.wav).
const T = {
  shotAEnd: 55,
  profileStart: 52,
  wipe: 68,
  profileEnd: 93,
  shotBStart: 90,
  bubbles: [97, 104, 111],
  endStart: 129,
};

const CAPTIONS: { from: number; to: number; text: string; accent?: boolean }[] = [
  { from: 5, to: 22, text: 'GUYS,' },
  { from: 22, to: 55, text: "IT'S NOT YOU." },
  { from: 55, to: 69, text: "IT'S YOUR" },
  { from: 69, to: 92, text: 'PROFILE.', accent: true },
  { from: 92, to: 109, text: 'FIX IT IN' },
  { from: 109, to: T.endStart, text: '30 MINUTES.' },
];

const ease = Easing.out(Easing.cubic);

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CAPTIONS.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const local = frame - c.from;
  const s = interpolate(local, [0, 4], [0.86, 1], { extrapolateRight: 'clamp', easing: ease });
  const o = interpolate(local, [0, 3], [0, 1], { extrapolateRight: 'clamp' });
  const bar = interpolate(local, [0, 7], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        top: 1388,
        transform: `scale(${s})`,
        transformOrigin: 'left center',
        opacity: o,
        fontFamily: INTER,
        fontWeight: 900,
        fontSize: 92,
        letterSpacing: -1.5,
        lineHeight: 1,
        color: C.white,
      }}
    >
      <span style={{ position: 'relative', display: 'inline-block', padding: c.accent ? '6px 18px 10px' : 0 }}>
        {c.accent && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: C.violet,
              borderRadius: 14,
              transform: `scaleX(${bar})`,
              transformOrigin: 'left',
            }}
          />
        )}
        <span style={{ position: 'relative' }}>{c.text}</span>
      </span>
    </div>
  );
};

const BottomShade: React.FC = () => (
  <AbsoluteFill
    style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.35) 100%)' }}
  />
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

// Scene A: realistic clip, frustrated man, "0 new matches".
const ShotA: React.FC = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, T.shotAEnd], [1.06, 1.14]);
  const exitX = interpolate(frame, [49, 56], [0, -1080], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const blur = interpolate(frame, [49, 53, 56], [0, 14, 24], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const chipO = interpolate(frame, [8, 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const chipY = interpolate(frame, [8, 14], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ transform: `translateX(${exitX}px)`, filter: `blur(${blur}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo src={staticFile('shotA.mp4')} playbackRate={0.8} muted style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
      </AbsoluteFill>
      <BottomShade />
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 1250,
          opacity: chipO,
          transform: `translateY(${chipY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 26px',
          borderRadius: 999,
          background: 'rgba(20,16,31,0.78)',
          border: '1.5px solid rgba(255,255,255,0.16)',
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 38,
          color: C.white,
        }}
      >
        <Heart size={36} color="rgba(255,255,255,0.55)" />
        0 new matches
      </div>
    </AbsoluteFill>
  );
};

const ProfileFace: React.FC<{ img: string; bio: string; tone: 'before' | 'after' }> = ({ img, bio, tone }) => (
  <AbsoluteFill style={{ background: tone === 'after' ? '#17112a' : '#141218' }}>
    <Img src={staticFile(img)} style={{ width: 800, height: 700, objectFit: 'cover', display: 'block' }} />
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 520,
        width: 800,
        height: 180,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
      }}
    />
    <div style={{ position: 'absolute', left: 40, top: 610, fontFamily: INTER, fontWeight: 800, fontSize: 56, color: C.white }}>
      Ryan <span style={{ fontWeight: 500, opacity: 0.85 }}>31</span>
    </div>
    <div style={{ position: 'absolute', left: 40, right: 40, top: 730 }}>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: tone === 'after' ? C.violetLight : C.muted }}>MY BIO</div>
      <div style={{ marginTop: 10, fontFamily: INTER, fontWeight: 500, fontSize: 32, lineHeight: 1.3, color: tone === 'after' ? C.white : 'rgba(255,255,255,0.55)' }}>{bio}</div>
    </div>
  </AbsoluteFill>
);

// Scene P: before -> after profile wipe (mirrors the Ryan card on the landing page).
const ProfileScene: React.FC = () => {
  const frame = useCurrentFrame(); // local, starts at T.profileStart
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });
  const inX = interpolate(enter, [0, 1], [1080, 0]);
  const wipeLocal = T.wipe - T.profileStart;
  const p = interpolate(frame, [wipeLocal, wipeLocal + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const lineX = p * 800;
  const exitLocal = T.profileEnd - T.profileStart;
  const exitS = interpolate(frame, [exitLocal - 4, exitLocal], [1, 1.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitO = interpolate(frame, [exitLocal - 3, exitLocal], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelAfter = interpolate(frame, [wipeLocal + 3, wipeLocal + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exitO, transform: `translateX(${inX}px) scale(${exitS})` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(900px 900px at 70% 30%, rgba(124,58,237,0.38), rgba(11,6,20,0) 70%)' }} />
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 300,
          width: 800,
          height: 900,
          borderRadius: 40,
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          border: '1.5px solid rgba(255,255,255,0.12)',
        }}
      >
        <ProfileFace img="before.jpg" tone="before" bio="Not good at bios. Love travel, food and good vibes. Just ask." />
        <AbsoluteFill style={{ clipPath: `inset(0 ${800 - lineX}px 0 0)` }}>
          <ProfileFace img="after.jpg" tone="after" bio="Terrible at karaoke. Great at finding the best ramen in any city. Your go-to order?" />
        </AbsoluteFill>
        {p > 0 && p < 1 && (
          <div style={{ position: 'absolute', left: lineX - 3, top: 0, width: 6, height: 900, background: C.white, boxShadow: `0 0 0 2px ${C.violet}` }} />
        )}
        <div
          style={{
            position: 'absolute',
            left: 28,
            top: 28,
            padding: '10px 22px',
            borderRadius: 999,
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 3,
            color: C.white,
            background: labelAfter > 0.5 ? C.violet : 'rgba(0,0,0,0.55)',
          }}
        >
          {labelAfter > 0.5 ? 'AFTER' : 'BEFORE'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MatchBubble: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 180 } });
  if (frame < start) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        width: 520,
        height: 76,
        padding: '0 22px',
        borderRadius: 24,
        background: 'rgba(255,255,255,0.93)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        transform: `translateX(${interpolate(s, [0, 1], [-560, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        fontFamily: INTER,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${C.violet}, #ec4899)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Heart size={28} color="#fff" filled />
      </div>
      <div style={{ fontWeight: 800, fontSize: 32, color: '#14101f' }}>New match!</div>
      <div style={{ marginLeft: 'auto', fontWeight: 500, fontSize: 24, color: 'rgba(20,16,31,0.5)' }}>now</div>
    </div>
  );
};

// Scene B: same man, delighted, matches pop in.
const ShotB: React.FC = () => {
  const frame = useCurrentFrame(); // local
  const local0 = 0;
  const punch = interpolate(frame, [local0, local0 + 6], [1.25, 1.06], { extrapolateRight: 'clamp', easing: ease });
  const drift = interpolate(frame, [6, 45], [1.06, 1.12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const z = frame < 6 ? punch : drift;
  const shakeX = Math.sin(frame * 0.9) * 2.5;
  const shakeY = Math.cos(frame * 0.7) * 2;
  const flash = interpolate(frame, [0, 2, 7], [0.85, 0.6, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px) scale(${z})` }}>
        <Img src={staticFile('happy.jpg')} style={{ width: 1080, height: 1920, objectFit: 'cover', objectPosition: 'center top' }} />
      </AbsoluteFill>
      <BottomShade />
      <div style={{ position: 'absolute', left: 72, top: 1108, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {T.bubbles.map((b) => (
          <MatchBubble key={b} start={b - T.shotBStart} />
        ))}
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${flash}), rgba(124,58,237,${flash * 0.8}))` }} />
    </AbsoluteFill>
  );
};

// Scene E: end card / CTA.
const EndCard: React.FC = () => {
  const frame = useCurrentFrame(); // local
  const { fps } = useVideoConfig();
  const item = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 7 });
    return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [36, 0])}px)` };
  };
  const bgIn = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, frame - 10) * 0.45);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: bgIn }}>
      <AbsoluteFill style={{ background: 'radial-gradient(1000px 900px at 30% 40%, rgba(124,58,237,0.45), rgba(11,6,20,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 90, right: 140, top: 560 }}>
        <div style={{ ...item(0), fontFamily: INTER, fontWeight: 800, fontSize: 34, letterSpacing: 7, color: C.violetLight }}>
          THE 10X MATCH SECRET™
        </div>
        <div style={{ ...item(2), marginTop: 30, fontFamily: INTER, fontWeight: 900, fontSize: 124, lineHeight: 0.98, letterSpacing: -3, color: C.white }}>
          Fix your
        </div>
        <div style={{ ...item(3), fontFamily: SERIF, fontStyle: 'italic', fontSize: 160, lineHeight: 1.0, color: C.violetLight }}>
          profile.
        </div>
        <div style={{ ...item(5), marginTop: 56 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              padding: '30px 46px',
              borderRadius: 999,
              background: C.violet,
              boxShadow: '0 18px 60px rgba(124,58,237,0.55)',
              transform: `scale(${pulse})`,
              transformOrigin: 'left center',
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 52,
              color: C.white,
            }}
          >
            Get it now · $9.90 →
          </div>
        </div>
        <div style={{ ...item(6), marginTop: 30, fontFamily: INTER, fontWeight: 500, fontSize: 32, color: C.muted }}>
          20 photo setups · 50 bios · 1 secret
        </div>
      </div>
      <div style={{ position: 'absolute', left: 90, top: 1440, fontFamily: INTER, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.45)' }}>
        Illustration. Results vary.
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const Ad: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0} durationInFrames={T.shotAEnd + 2}>
      <ShotA />
    </Sequence>
    <Sequence from={T.profileStart} durationInFrames={T.profileEnd - T.profileStart}>
      <ProfileScene />
    </Sequence>
    <Sequence from={T.shotBStart} durationInFrames={T.endStart - T.shotBStart + 3}>
      <ShotB />
    </Sequence>
    <Sequence from={T.endStart}>
      <EndCard />
    </Sequence>
    <Caption />

    <Audio src={staticFile('vo.wav')} />
    <Sfx at={0} src="pop.wav" volume={0.35} />
    <Sfx at={48} src="whoosh.wav" volume={0.45} />
    <Sfx at={T.wipe - 1} src="swish.wav" volume={0.4} />
    <Sfx at={T.shotBStart - 3} src="whoosh.wav" volume={0.4} />
    {T.bubbles.map((b) => (
      <Sfx key={b} at={b} src="ping.wav" volume={0.3} />
    ))}
    <Sfx at={T.endStart} src="impact.wav" volume={0.55} />
  </AbsoluteFill>
);
