import React from 'react';
import { Composition } from 'remotion';
import { Vsl, DURATION } from './Vsl';

export const Root: React.FC = () => (
  <Composition id="Vsl" component={Vsl} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
