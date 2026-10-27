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
