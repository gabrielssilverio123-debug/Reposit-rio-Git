import React from 'react';
import { Composition } from 'remotion';
// Import ONLY the template this ad uses: each template anchors its scenes to words
// of public/words.json when it loads, so an unused template would fail on missing words.
//   POV / reaction split-screen:  import { AdPOV as Ad } from './TemplatePOV';
//   Curiosity / secret:           import { AdSecret as Ad } from './TemplateSecret';
//   Before/after transformation:  import { AdTransformation as Ad } from './TemplateTransformation';
import { AdPOV as Ad } from './TemplatePOV';

export const Root: React.FC = () => (
  <Composition id="Ad" component={Ad} durationInFrames={900} fps={30} width={1080} height={1920} />
);
