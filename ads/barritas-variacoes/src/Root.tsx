import React from 'react';
import { Composition } from 'remotion';
import { Var1, DURATION } from './Var1';

export const Root: React.FC = () => (
  <Composition id="Var1" component={Var1} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
);
