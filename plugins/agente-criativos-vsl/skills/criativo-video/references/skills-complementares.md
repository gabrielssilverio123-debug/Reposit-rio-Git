# Skills complementares (Reelsmaker, CoDesign, Creative Claw)

O agente funciona sozinho com a skill `criativo-video`. Estas três ampliam o que ele entrega. **Na Etapa 0, verifique em silêncio quais estão disponíveis** e só ofereça nas perguntas o que funciona na sessão.

## Verificação rápida (Etapa 0, sem mostrar à pessoa se estiver tudo certo)
| Skill | Como verificar | Disponível quando |
|---|---|---|
| **Reelsmaker** (`it-reelsmaker`) | Existe na lista de skills e `python3 "<skill>/scripts/doctor.py"` termina com "required: all present" | Claude Code com ffmpeg, Node e Python |
| **CoDesign** (`codesign:*`, IMG.LY) | Ferramenta `mcp__plugin_codesign_codesign__diagnostics` → `login.signedIn: true` e acesso a `*.img.ly` | Logado na conta IMG.LY e rede liberada |
| **Creative Claw** (`creative-claw:*`) | As ferramentas `mcp__plugin_creative-claw_*` aparecem na sessão | Conta Creative Claw e rede liberada para `*.creativeclaw.co` |

Se uma delas estiver instalada mas indisponível, diga em **uma linha** o que falta (login, domínio na rede) e siga com a alternativa. Não bloqueie o fluxo.

---

## Reelsmaker: editar vídeo que a pessoa gravou (9:16)
**Quando usar:**
- a pessoa enviou **vídeo próprio falando para a câmera** (talking head, entrevista a dois, vídeo horizontal para virar vertical);
- a pessoa quer **perfil de marca salvo** (cores, fontes, logo, tom), reutilizado em todos os vídeos;
- precisa de **layout que respeita o rosto** (texto nunca sobre o rosto, legenda abaixo do queixo, zoom medido);
- tradução de legendas, capa (cover) do Reels, recorte da pessoa.

**Como encaixar no fluxo:**
- **Etapa 3, "Quem aparece? → Vídeo gravado por você":** use o fluxo do Reelsmaker:
  1. `doctor.py`;
  2. perfil de marca em `brands/<slug>/`;
  3. transcrição;
  4. corte grosso (retakes e pausas);
  5. layout por rosto;
  6. legendas;
  7. cenas desenhadas (gancho, número, lista, CTA);
  8. master −14 LUFS.
- **Roteiro aprovado no nosso fluxo:** ele vira o "brief" do Reelsmaker. Mantenha o Método Kishu (VSL) e os efeitos de `efeitos.md` quando a pessoa pedir.
- **Dependências opcionais** (instale só se precisar):
  - `faster-whisper` para transcrição local. O modelo vem do Hugging Face; se a rede bloquear, transcreva com ElevenLabs `creative_transcribe_audio` e passe os tempos;
  - `opencv-python-headless` + modelo YuNet para medir rostos;
  - `rembg` para recortar a pessoa.

**Alternativa:** `scripts/takes.py` (melhor tomada), `scripts/tighten.py --video` (corta as pausas), `scripts/chroma.sh` (tela verde) e os modelos Remotion do agente.

---

## CoDesign (IMG.LY): peças estáticas e animadas da campanha
**Quando usar:**
- **capa ou thumbnail da VSL**, capa do Reels, banner da página, post e carrossel do feed, stories estático;
- **end card** ou tela final com preço e CTA, para usar no vídeo;
- **redimensionar** a mesma peça para vários formatos (feed, stories, 16:9);
- **animar** uma peça estática para mp4 curto (criativo de imagem animada);
- **localizar** a peça para outro idioma, mantendo o layout.

**Como encaixar no fluxo:**
- **Etapa 5:** ofereça *"Quer as peças estáticas da campanha (capa da VSL, thumbnail, 3 posts e stories) no mesmo visual?"*.
- **Entrada:** use o kit da marca (cores, fontes, logo) e as imagens oficiais extraídas da página.
- **Regras da CoDesign:**
  - antes de qualquer `edit`, carregue a skill `handbook` e as skills `api`/`judge`;
  - pergunte uma rodada de opções de visual;
  - passe pelo `judge` antes de entregar;
  - exporte em PNG/JPG/PDF/MP4.
- **Login na nuvem:** chame `login`. A pessoa abre o link, entra na conta e, no erro final do navegador (`127.0.0.1:…/callback?code=…`), **copia o endereço e cola no chat**. Conclua com `curl --noproxy 127.0.0.1 "<endereço>"`. Isso exige `clerk.img.ly` liberado na rede.

**Alternativa:** gere a peça no Remotion (`npx remotion still` com o mesmo layout do vídeo) ou com imagens do HeyGen/ElevenLabs. Ofereça Canva se o conector estiver ativo.

---

## Creative Claw: música, efeitos sonoros e voz sob medida
**Quando usar:**
- **trilha original** com a duração exata do vídeo (ex.: 2 min com virada no plot twist), quando a biblioteca do HeyGen não tiver algo adequado;
- **efeitos sonoros específicos** (registradora, digitação, "pop" de notificação, whoosh com a energia da marca);
- **voiceover** alternativo e **avatar/UGC** quando HeyGen ou ElevenLabs não estiverem disponíveis;
- planejamento de filme com vários planos (`creativeclaw-build-film`) para criativos mais cinematográficos.

**Como encaixar no fluxo:**
- **Etapa 3, pergunta de música:** com Creative Claw disponível, acrescente a opção **"Trilha original sob medida (gera custo)"**.
- **Etapa 4:** gere a trilha com a duração do vídeo e os pontos de energia (dor, virada, oferta). Informe o custo antes.

**Alternativa:**
- biblioteca de músicas e efeitos do HeyGen (`search_audio_sounds`; para efeitos, use `minScore` 0.4);
- ElevenLabs Music e efeitos (se houver créditos);
- versão "sem música" para usar a biblioteca do Meta.

---

## Domínios de rede (Claude Code na nuvem)
Libere em **Network access → Allowed domains** e abra uma sessão nova:
- **CoDesign:** `img.ly`, `*.img.ly` (inclui `clerk.img.ly`, `cdn.img.ly` e `gateway.img.ly`).
- **Creative Claw:** `creativeclaw.co`, `*.creativeclaw.co` (inclui `app.creativeclaw.co` e `clerk.creativeclaw.co`).
- **Reelsmaker:** nada extra. Para transcrição local, o download do modelo precisa de `huggingface.co` e `*.hf.co`.
