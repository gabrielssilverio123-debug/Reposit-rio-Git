---
name: baixar-referencia
description: Baixa um vídeo de referência pelo link (YouTube, TikTok, Instagram, Facebook, Biblioteca de Anúncios do Meta ou link direto de MP4) com yt-dlp e prepara a análise com MP4 até 1080p, áudio WAV para transcrição, contact sheet e legendas automáticas quando houver. Use quando a pessoa mandar o link de um criativo, VSL ou concorrente como referência. Parte do Agente Criativo e VSL.
---

# Baixar referência com yt-dlp

```bash
bash "<skill>/scripts/baixar.sh" "<url>" ads/<nome>/assets/referencias ref1
```

- **Saídas:**
  - `ref1.mp4`;
  - `ref1.wav` (16 kHz, pronto para `transcrever-whisper`);
  - `ref1.contact.jpg` (24 quadros);
  - `ref1.info.json` (título, autor, duração);
  - `ref1.*.srt`, se a plataforma tiver legendas.
- **Instalação:** o script instala o `yt-dlp` na primeira vez, se faltar.
- **Onde salvar:** guarde a referência em `assets/` (fica fora do git). Nunca a publique nem a reutilize no criativo.

## Depois de baixar
1. Abra a contact sheet e assista aos quadros-chave.
2. Transcreva o áudio com `transcrever-whisper`.
3. Monte a ficha da referência:
   - gancho dos 3 primeiros segundos;
   - estrutura (ângulo e Kishu, se for VSL);
   - ritmo de cortes;
   - efeitos usados;
   - CTA.
4. Mostre a ficha à pessoa antes de usar.

Referência de terceiros serve para estrutura, ritmo e estilo, nunca para copiar imagens, voz, rosto ou música.

## Rede e alternativas
- No Claude Code na nuvem, libere em **Network access** os domínios da plataforma:
  - YouTube: `youtube.com`, `*.youtube.com`, `*.googlevideo.com`, `*.ytimg.com`;
  - TikTok: `tiktok.com`, `*.tiktok.com`, `*.tiktokcdn.com`;
  - Instagram e Facebook: `instagram.com`, `*.instagram.com`, `*.cdninstagram.com`, `facebook.com`, `*.facebook.com`, `*.fbcdn.net`.
- Alguns vídeos do Instagram e do Facebook exigem login. Nesses casos, peça à pessoa que baixe o vídeo e envie o arquivo no chat.
- Sem acesso à rede, o caminho é o mesmo: a pessoa envia o arquivo.
