# Plugin "criativos-video" para Claude Code

Agente para criar **criativos em vídeo e VSLs para qualquer nicho** (Meta Ads, TikTok, Reels):
briefing a partir da landing page → ângulo → roteiro com aprovação → narração → avatar UGC com lip-sync →
imagens e clipes → música e efeitos → montagem com motion em Remotion → legendas → master −14 LUFS →
versões com e sem música → entrega.

## O que vem dentro
- `agents/video-creative-director.md`: o agente (subagente) "diretor de criativos".
- `skills/criativo-video/`: o método completo
  - `SKILL.md`: fluxo e regras;
  - `references/angulos.md`: 8 ângulos/formatos (inclui VSL) com estruturas e ganchos para vários nichos;
  - `references/compliance.md`: regras do Meta por categoria (saúde, finanças, cripto, namoro, educação…);
  - `references/pipeline.md`: passo a passo técnico (HeyGen, ElevenLabs, Remotion, ffmpeg);
  - `references/brand-10x-match.md`: exemplo de ficha de marca (copie para cada produto novo);
  - `scripts/`: `tighten.py` (pausas da narração), `master.sh` (loudness), `srt.py` (legendas);
  - `templates/remotion/`: 3 modelos testados (POV/reação, Curiosidade/segredo, Transformação).

## Instalação
**Opção A: em um projeto (recomendado)**
1. Descompacte o zip na raiz do projeto, de forma que fique `plugins/criativos-video/`.
2. Copie (ou crie links) para a pasta `.claude` do projeto:
   - `plugins/criativos-video/skills/criativo-video` → `.claude/skills/criativo-video`
   - `plugins/criativos-video/agents/video-creative-director.md` → `.claude/agents/video-creative-director.md`
3. Abra o Claude Code no projeto. A skill aparece como `/criativo-video` e o agente como `video-creative-director`.

**Opção B: para todos os seus projetos**
Copie as mesmas pastas para `~/.claude/skills/` e `~/.claude/agents/`.

**Opção C: como plugin** (marketplace próprio ou da organização)
Esta pasta já segue o formato de plugin (`.claude-plugin/plugin.json`). Publique-a em um repositório de marketplace e instale com `/plugin`.

## Como usar
- "Use o video-creative-director para criar um anúncio de 30 s para esta landing page: <link ou HTML>."
- "/criativo-video VSL de 3 minutos para meu curso de inglês, público iniciante, voz feminina."
- "Crie 3 variações de gancho para o criativo X para teste A/B."

## Requisitos
- Node 18+, ffmpeg, Python 3, Chromium (para Remotion).
- Conectores recomendados: HeyGen (voz, avatar, imagens, biblioteca de música/SFX), ElevenLabs (voz, imagem, vídeo).
  Opcionais: Creative Claw, Higgsfield.
- Em ambientes na nuvem com rede restrita, libere `*.heygen.ai` e o domínio do Creative Claw em Network access.
