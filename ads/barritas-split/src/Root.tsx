import React from 'react';
import { Composition } from 'remotion';
import { Split, DURATION } from './Split';

export const Root: React.FC = () => (
  <Composition id="Split" component={Split} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
);
