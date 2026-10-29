# Pipeline de produção (ferramentas e comandos)

Pasta de cada criativo: `ads/<nome>/` com `assets/` (brutos, fora do git), `public/` (mídia usada no render), `src/` (Remotion), `final/` (entregáveis), `ROTEIRO.md`.

## 0. Setup do projeto Remotion
```bash
cp -r <skill>/templates/remotion ads/<nome> && cd ads/<nome>
npm install            # ou reutilize um node_modules existente com symlink
# escolha o template em src/Root.tsx (importe só um: TemplatePOV, TemplateSecret ou TemplateTransformation)
# ajuste durationInFrames em src/Root.tsx (30 * segundos); composição "Ad", 1080x1920, 30 fps
```
Render: `npx remotion render src/index.ts Ad out/render.mp4 --crf=17 --browser-executable=<chromium>`
Still: `npx remotion still src/index.ts Ad out/s.png --frame=N`
Áudio sem música: `npx remotion render src/index.ts Ad out/nomusic.wav --codec=wav --props='{"noMusic":true}'`

## 1. Narração
- **HeyGen** `list_voices` (gênero/idioma) → `create_speech_without_player` (`speed` 1.05–1.12, `<break time="0.3s"/>` entre frases). Retorna `word_timestamps`.
- **ElevenLabs** `creative_list_voices` → `creative_generate_speech` (eleven_v4 aceita tags de emoção).
- Salve os timestamps em `assets/words.json` no formato `[{"word","start","end"}]` (sem as entradas `<break>`).

## 2. Ajuste de pausas
`python3 scripts/tighten.py --audio assets/vo_raw.mp3 --words assets/words.json --out public/vo.wav --words-out public/words.json [--target 27.5]`
Mantém a voz natural (sem acelerar, salvo se `--target` exigir), deixa ~0.17 s entre palavras e ~0.30 s entre frases.

### Vídeo gravado (pessoa real)
- Repetições: `python3 scripts/takes.py --video bruto.mp4 --words transcricao.json --script roteiro.txt --out assets/takes.mp4 --words-out assets/takes_words.json` (transcrição com tempos por palavra: ElevenLabs `creative_transcribe_audio`).
- Pausas: `python3 scripts/tighten.py --audio assets/takes.mp4 --words assets/takes_words.json --out public/vo.wav --words-out public/words.json --video assets/takes.mp4 --video-out public/presenter.mp4`.
- Fundo verde: `bash scripts/chroma.sh bruto.mp4 public/recorte.webm` → componente `TelaVerde`.

## 3. Avatar UGC com lip-sync (HeyGen)
1. `create_prompt_avatar` (9:16, descrição detalhada; inclua "no on-screen interface, no recording indicator, no text").
2. Upload do áudio editado: `create_asset_upload` → `PUT` no `upload_url` (headers `content-type` e `x-amz-server-side-encryption: AES256`) → `complete_asset_upload`.
3. `create_video_from_avatar` (audioAssetId, 9:16, 1080p, fit cover, expressiveness high, motionPrompt com gestos por trecho).
4. Poll `get_video` (2–4 min). Confira se veio interface "gravada" (barra de status do iPhone, "REC", barra de início, player); se sim, recorte antes de editar: `ffmpeg -i in.mp4 -vf "crop=950:1690:65:150,scale=1080:1920,fps=30" -an public/presenter.mp4` (ajuste o crop ao que aparecer).
5. Para **Tela verde**, peça `outputFormat: "webm"` (fundo transparente).
6. Casal/duas pessoas com rostos consistentes: gere cada personagem com `create_prompt_avatar` e depois a cena juntos passando as duas imagens em `referenceImages`.

## 4. Imagens e clipes
- Personagens/cenas: HeyGen `create_prompt_avatar` (gera foto fotorrealista a partir de texto, baixo custo), ElevenLabs `creative_generate_image` (Seedream/Nano Banana; estime antes), Higgsfield se houver créditos.
- Clipes realistas: HeyGen `image_to_video` (5 s) ou ElevenLabs `creative_generate_video` (LTX 2 Fast é o mais barato).
- Consistência de personagem: gere a imagem-base e use-a como referência/primeiro quadro.

## 5. Música e efeitos
- HeyGen `search_audio_sounds` (`type: music` ou `sound_effects`) — URLs S3 baixáveis. Confirme a licença para uso fora da plataforma.
- Creative Claw (`generate_sound_effect`, `generate_music`) ou ElevenLabs (sfx/music nodes) quando disponíveis.
- Mix: voz ~8–12 dB acima da música; SFX 0.2–0.5 de volume; um som por transição.

## 6. Download quando o host do arquivo estiver bloqueado
Se `files2.heygen.ai` / `resource2.heygen.ai` derem 403 no proxy:
1. ElevenLabs `creative_attach_reference_file` com a URL.
2. Áudio/imagem: `creative_get_available_assets` → `preview_url` (mp3 ou thumbnail ~1024 px).
3. Vídeo: `creative_add_flow_asset_node` + nó `composition` (`eleven_composition`, custo 0) → `creative_run_flow_nodes` → `content_url` do resultado.
(Melhor solução: liberar esses domínios em Network access do ambiente.)

## 7. Masterização e legendas
`bash scripts/master.sh out/render.mp4 out/render.mp4 final/<nome>.mp4`
`bash scripts/master.sh out/render.mp4 out/nomusic.wav final/<nome>_no-music.mp4`
`python3 scripts/srt.py public/words.json final/<nome>.en.srt --offset 0.167`
Contact sheet: `ffmpeg -i final/<nome>.mp4 -vf "fps=0.6,scale=180:320,tile=9x2" -frames:v 1 final/contact-sheet.jpg`

## 8. Entrega
`ROTEIRO.md` · commit/push de `ads/<nome>/` (sem `node_modules`, `out/`, `assets/`) · `SendUserFile` com os MP4 (`display: attach`) e o contact sheet (`display: render`).

## 9. VSL em 16:9 (aprendizados da produção "Barritas Que Venden")
- **Modelo:** `templates/remotion/src/TemplateVSL16x9.tsx` (composição `Vsl`, 1920×1080, `durationInFrames` = segundos × 30).
- **Apresentadora a partir da foto da persona:**
  1. Suba a foto com `create_asset_upload` → PUT → `complete_asset_upload`.
  2. Gere o look com `create_prompt_avatar` (`referenceImages: [{type:"asset_id", asset_id}]`, `aspectRatio:"16:9"`), descrevendo cenário e figurino.
  3. Gere o vídeo com `create_video_from_avatar` com o áudio já editado (`aspectRatio:"16:9"`, `expressiveness:"high"`, `motionPrompt` por trecho).
- **Um único vídeo da apresentadora** reenquadrado por cena: tela cheia com zoom nas frases de impacto, metade direita nas explicações. Isso mantém a sincronia labial perfeita.
- **Imagens pela ponte do ElevenLabs** (`preview_url`) chegam com 1024 px. Use-as como cartões de cerca de 50% da largura ou com zoom lento. Para tela cheia nítida, prefira vídeo: `image_to_video` a 1080p, 5 s (passe a URL do HeyGen; ele mesmo baixa). O vídeo sai em resolução cheia pela composição gratuita.
- **Efeitos sonoros da biblioteca HeyGen:** `search_audio_sounds` com `type:"sound_effects"` e `minScore: 0.4`. As buscas com o score padrão costumam voltar vazias.
- **Música para mais de 60 s:** junte duas trilhas com `acrossfade`, uma mais calma na dor e uma mais animada a partir da virada.
- **Render longo:** cerca de 1 min de render para cada 10 s de vídeo em 1080p. Rode em segundo plano com `timeout` de 30 min ou mais.
- **Limite do GitHub (100 MB):**
  - o vídeo final passa por `master.sh` e depois por `ffmpeg -c:v libx264 -crf 22 -preset slow -c:a copy -movflags +faststart`, ficando com cerca de 50 MB para 2 min;
  - arquivos de entrada acima de 100 MB (como o vídeo bruto da apresentadora) ficam no `.gitignore`, com a origem anotada.
- **Legibilidade no celular:**
  - texto principal de 64–260 px;
  - nada abaixo de 40 px em balões de chat;
  - evite `WebkitTextStroke` (gera falhas nas letras); use `textShadow`.

## 10. VSL longa (10–20 min)
- **Narração:** gere por bloco do Kishu (4–8 trechos de até ~3 min), com uma chamada por trecho, e junte com `concat`. Isso facilita refazer só um bloco.
- **Apresentadora:** um vídeo com sincronia labial por bloco (mesmo look). Na montagem, cada bloco é um `<Sequence>` com o seu vídeo.
- **Render por blocos:**
  - renderize cada bloco com `--frames=início-fim`, em segundo plano com `timeout` máximo, e una com `ffmpeg -f concat`;
  - conte com ~1 min de render a cada 10 s de vídeo, ou seja, ~2 h para 20 min.
- **Master:** master e compressão no arquivo unido. Para 20 min, use `-crf 24`. Se passar de 100 MB, entregue pelo chat e deixe o arquivo fora do git, anotando no ROTEIRO.md.
- **Cortes de anúncio:** gere 3–5 cortes de 15–30 s (9:16) da Base 1 e da Base 3.
