import React from 'react';
import { Composition } from 'remotion';
import { Var1, DURATION } from './Var1';
import { Var2, DURATION as DURATION2 } from './Var2';
import { Var3, DURATION as DURATION3 } from './Var3';

export const Root: React.FC = () => (
  <>
    <Composition id="Var1" component={Var1} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="Var2" component={Var2} durationInFrames={DURATION2} fps={30} width={1080} height={1920} />
    <Composition id="Var3" component={Var3} durationInFrames={DURATION3} fps={30} width={1080} height={1920} />
  </>
);
