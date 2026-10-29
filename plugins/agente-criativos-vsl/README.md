# Agente de Criação de Criativos e VSL (plugin para Claude Code)

Agente para criar **criativos em vídeo e VSLs para qualquer nicho** (Meta Ads, TikTok, Reels):
briefing a partir da landing page → ângulo → roteiro com aprovação → narração → avatar UGC com lip-sync →
imagens e clipes → música e efeitos → montagem com motion em Remotion → legendas → master −14 LUFS →
versões com e sem música → entrega. VSLs pelo Método Kishu, em 9:16 ou 16:9.

## Comece aqui
- **Instalação** (repositório limpo, skills, conectores HeyGen/ElevenLabs e alternativas, ambiente, teste): veja **`INSTALACAO.md`**.
- **Uso:** digite **"agente criativo e vsl"**, sozinho ou com o pedido (ex.: *"agente criativo e vsl, quero uma VSL de 10 min"*). O agente conduz um **fluxo guiado** com perguntas de múltipla escolha: o que criar, formato, duração, idioma, página, nicho, público, ângulo, rosto, voz e música. Depois vêm o roteiro para aprovação, a produção com checkpoints e os ajustes. Diga *"modo rápido"* para usar os padrões recomendados.

## O que vem dentro
- `agents/agente-criativos-vsl.md`: o **Agente de Criação de Criativos e VSL** (subagente).
- `skills/criativo-video/`: o método completo
  - `SKILL.md`: fluxo e regras;
  - `references/fluxo-guiado.md`: o roteiro da conversa (também incorporado no próprio agente) (perguntas, opções, checkpoints, modo rápido, idiomas);
  - `references/skills-complementares.md`: quando usar Reelsmaker, CoDesign e Creative Claw (e as alternativas);
  - `references/angulos.md`: 8 ângulos/formatos (inclui VSL) com estruturas e ganchos para vários nichos;
  - `references/vsl-kishu.md`: Método Kishu, a base de toda VSL (início impactante → história → plot twist com mecanismo → oferta irresistível);
  - `references/efeitos.md`: catálogo dos 15 efeitos de edição (gancho animado, palavra que bate, legenda gigante, barra de comando, melhor tomada, lista riscada, solta o arquivo, corta as pausas, carimbo, antes e depois, tela verde, zoom no rosto, tela dividida, notificação, pede comentário);
  - `references/compliance.md`: regras do Meta por categoria (saúde, finanças, cripto, namoro, educação…);
  - `references/pipeline.md`: passo a passo técnico (HeyGen, ElevenLabs, Remotion, ffmpeg);
  - `references/brand-10x-match.md`: exemplo de ficha de marca (copie para cada produto novo);
  - `scripts/`: `tighten.py` (corta as pausas — áudio e vídeo), `takes.py` (melhor tomada), `chroma.sh` (tela verde), `master.sh` (loudness), `srt.py` (legendas);
  - `templates/remotion/`: 4 modelos testados (POV/reação, Curiosidade/segredo, Transformação e VSL 16:9) + `Efeitos.tsx` (biblioteca dos efeitos, com a composição `EfeitosDemo` para visualizar todos).

## Instalação
**Opção A: em um projeto (recomendado)**
1. Descompacte o zip na raiz do projeto, de forma que fique `plugins/agente-criativos-vsl/`.
2. Copie (ou crie links) para a pasta `.claude` do projeto:
   - `plugins/agente-criativos-vsl/skills/criativo-video` → `.claude/skills/criativo-video`
   - `plugins/agente-criativos-vsl/agents/agente-criativos-vsl.md` → `.claude/agents/agente-criativos-vsl.md`
3. Abra o Claude Code no projeto. A skill aparece como `/criativo-video` e o agente como `agente-criativos-vsl`.

**Opção B: para todos os seus projetos**
Copie as mesmas pastas para `~/.claude/skills/` e `~/.claude/agents/`.

**Opção C: como plugin** (marketplace próprio ou da organização)
Esta pasta já segue o formato de plugin (`.claude-plugin/plugin.json`). Publique-a em um repositório de marketplace e instale com `/plugin`.

## Como usar
- "agente criativo e vsl"
- "agente criativo e vsl, criativo de 30 s para esta página: <link>"
- "agente criativo e vsl, VSL de 15 min em espanhol para este vídeo de referência"
- "/criativo-video VSL de 3 minutos para meu curso de inglês, público iniciante, voz feminina."
- "Crie 3 variações de gancho para o criativo X para teste A/B."

## Requisitos
- Node 18+, ffmpeg, Python 3, Chromium (para Remotion).
- Conectores recomendados: HeyGen (voz, avatar, imagens, biblioteca de música/SFX), ElevenLabs (voz, imagem, vídeo).
  Opcionais: Creative Claw, Higgsfield.
- Em ambientes na nuvem com rede restrita, libere `*.heygen.ai` e o domínio do Creative Claw em Network access.
