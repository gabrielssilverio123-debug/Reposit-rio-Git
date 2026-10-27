import React from 'react';
import { Composition } from 'remotion';
import { EfeitosDemo, DEMO, DEMO_STEP } from './Efeitos';
// Import ONLY the template this ad uses: each template anchors its scenes to words
// of public/words.json when it loads, so an unused template would fail on missing words.
//   POV / reaction split-screen:  import { AdPOV as Ad } from './TemplatePOV';
//   Curiosity / secret:           import { AdSecret as Ad } from './TemplateSecret';
//   Before/after transformation:  import { AdTransformation as Ad } from './TemplateTransformation';
//   Blank (effects only):         write your scenes with the components from './Efeitos'.
import { AdPOV as Ad } from './TemplatePOV';

export const Root: React.FC = () => (
  <>
    <Composition id="Ad" component={Ad} durationInFrames={900} fps={30} width={1080} height={1920} />
    {/* Catalog of every effect in references/efeitos.md — render it to preview them. */}
    <Composition id="EfeitosDemo" component={EfeitosDemo} durationInFrames={DEMO.length * DEMO_STEP} fps={30} width={1080} height={1920} />
  </>
);
