import React from 'react';
import { Composition } from 'remotion';
import { Ad } from './Ad';

export const Root: React.FC = () => (
  <Composition id="Ad" component={Ad} durationInFrames={150} fps={30} width={1080} height={1920} />
);
