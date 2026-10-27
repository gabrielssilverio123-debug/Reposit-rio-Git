---
name: criativo-video
description: Cria criativos em vídeo (5–60 s) e VSLs (1–10 min) para Meta Ads, TikTok e Reels, para qualquer nicho (infoproduto, saúde, finanças, e-commerce, SaaS, educação, relacionamento, serviços locais…) a partir de uma landing page ou oferta — briefing, escolha de ângulo, roteiro, narração, avatar UGC com lip-sync, imagens, montagem com motion em Remotion, legendas palavra a palavra, música, efeitos sonoros e masterização em −14 LUFS. Use quando pedirem anúncio em vídeo, criativo, VSL, roteiro de anúncio, hook, UGC, POV, antes e depois ou variação de criativo.
---

# Criativos em vídeo e VSL

Fale com a pessoa no idioma dela. O texto **dentro** do vídeo segue o idioma do público do anúncio.

## Princípios (não negociáveis)

1. **Roteiro antes de gastar.** Mostre ângulo + roteiro + custo estimado e só gere mídia paga depois do "ok".
2. **Estime custo antes de cada geração paga** (`estimate_only` / `get_cost`) e nunca repita uma geração para "tentar de novo" — cada chamada cobra.
3. **Conformidade Meta** — leia `references/compliance.md` antes de escrever o roteiro.
4. **Depoimento/prova só se for real e autorizado.** Pessoa gerada por IA é sempre personagem/encenação, nunca "cliente".
5. **Verifique visualmente** (stills e contact sheet) antes de entregar; meça loudness.
6. **Entregue duas versões**: com música e sem música (para usar a biblioteca de músicas do Meta).
7. **Commit + push** da pasta do criativo e envie os MP4 no chat (`SendUserFile`, `display: attach`).

## Fluxo

### 1. Briefing
- Leia a landing page (HTML enviado ou URL). Se o HTML for um bundle que exige JS, renderize com Playwright/Chromium e extraia `document.body.innerText` + screenshots.
- Extraia: produto, preço/âncora, garantia, promessa, mecanismo único, módulos/entregáveis, provas, FAQ (objeções), público, paleta e fontes.
- Pergunte só o que faltar: duração, plataforma, gênero/idade do público, voz (masc./fem.), se existem provas reais autorizadas.

### 2. Ângulo e formato
Escolha em `references/angulos.md` (antes/depois, curiosidade/segredo, POV dela, POV dele, inimigo comum, VSL longa). Para testes A/B, varie **o ângulo**, não só a cor.

**VSL:** toda VSL segue o **Método Kishu** (`references/vsl-kishu.md`) — início impactante fora do enredo do produto (dor, medo, curiosidade, absurdo ou emocionante) → desenvolvimento da história entrando no subnicho sem o lead perceber → plot twist com o mecanismo único → oferta irresistível sem forçar. O roteiro mostra as 4 bases marcadas. Nos criativos curtos, use o Kishu só quando ajudar (ex.: abrir com um pilar de início impactante).

### 3. Roteiro
- 30 s ≈ 80–90 palavras faladas; 5 s ≈ 10–12; VSL: ~150 palavras/min.
- Na tabela do roteiro, inclua a coluna **Efeito** (nome do efeito do catálogo usado em cada cena).
- Gancho em 0–3 s (texto na tela + fala + impacto sonoro). Quebre 1–2 objeções do FAQ. Prova. Oferta com âncora de preço e garantia. CTA "Tap below…".
- Entregue tabela Tempo · Cena · Efeito · Narração · Som + texto corrido + 2–3 ganchos alternativos (VSL: blocos [BASE 1]–[BASE 4] do Kishu).

### 4. Produção (ver `references/pipeline.md`)
1. Narração (HeyGen `create_speech_without_player` ou ElevenLabs) com timestamps por palavra.
2. `scripts/tighten.py` encurta pausas e remapeia os tempos das palavras ("Corta as pausas"; com `--video` corta também o vídeo gravado). Vídeo gravado com repetições: `scripts/takes.py` ("Melhor tomada") antes do tighten.
3. Avatar UGC (HeyGen `create_prompt_avatar` → `create_video_from_avatar` com o áudio editado) ou clipes realistas (image-to-video).
4. Imagens (perfis, antes/depois, produto) — personagens fictícios gerados por IA.
5. Música e SFX (biblioteca HeyGen `search_audio_sounds`, Creative Claw ou ElevenLabs).
6. Montagem: copie `templates/remotion/` para `ads/<nome>/`, escolha o template mais próximo e adapte textos, imagens e âncoras de palavras (`at('palavra', n)`).
   **Efeitos obrigatórios no repertório** (`references/efeitos.md`, componentes em `src/Efeitos.tsx`): gancho animado, palavra que bate, legenda gigante, barra de comando, melhor tomada, lista riscada, solta o arquivo, corta as pausas, carimbo, antes e depois, tela verde, zoom no rosto, tela dividida, notificação e pede comentário. Em criativo curto, use vários (um a cada 1,5–4 s, sempre com som); na VSL, quando servirem à história. Diga no roteiro quais efeitos entram em cada cena.
7. Stills nos momentos-chave → corrigir sobreposições → render.
8. `scripts/master.sh` (−14 LUFS, pico ≤ −1 dBTP, `+faststart`) com e sem música; `scripts/srt.py` gera a legenda .srt.

### 5. Entrega
- `ROTEIRO.md` na pasta do criativo (estratégia, roteiro, produção, conformidade, textos sugeridos para o Meta: texto principal, título, botão).
- Contact sheet, commit/push, arquivos no chat e resumo curto do que foi feito e do que precisa de atenção.

## Regras de layout (1080×1920)
- Zonas de interface: topo 0–220 px, base 1500–1920 px, direita 960–1080 px → nada importante ali.
- Nunca texto sobre rosto. Legenda grande (70–90 px, peso 900), palavra ativa na cor de destaque.
- Uma cor de destaque por vídeo; troca de cena a cada 1,5–4 s; som em cada transição.
- Voz ~8–12 dB acima da música; trilha com fade no final.

## Qualquer nicho
- O método é o mesmo para qualquer produto; o que muda é a ficha de marca, o ângulo e as regras da categoria.
- Para um produto novo, crie `brand-<produto>.md` (na pasta do criativo ou nas referências) com: produto e entregáveis, preço/âncora, garantia, mecanismo, provas reais, objeções do FAQ, público, paleta, tipografia e vozes. Modelo: `references/brand-10x-match.md`.
- Confira a categoria em `references/compliance.md` (saúde, finanças, cripto, namoro, educação, suplementos e categorias especiais têm regras próprias).
- Adapte o cenário do avatar e das cenas ao nicho (academia, cozinha, escritório, loja, clínica…) e o tom de voz ao público (energia para e-commerce/jovem; calma e autoridade para saúde/finanças).
- Os templates são pontos de partida: troque textos, imagens, cores (objeto `C`) e cenas; mantenha legendas, zonas seguras, SFX e master.
