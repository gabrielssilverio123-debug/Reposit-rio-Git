---
name: transcrever-whisper
description: Transcreve áudio ou vídeo com Whisper (faster-whisper, local) e gera tempos por palavra (.words.json no formato dos templates Remotion), legenda .srt e texto. Use para analisar um criativo ou VSL de referência, legendar um vídeo gravado pela pessoa, alinhar legendas de uma narração que não veio com timestamps ou conferir o que foi falado. Parte do Agente Criativo e VSL.
---

# Transcrever com Whisper

```bash
python3 "<skill>/scripts/transcrever.py" referencias/ref.mp4 --idioma es --modelo small
```

- **Saídas:** `ref.words.json` (lista `{word, start, end}`), `ref.srt` e `ref.txt`, na pasta do arquivo (ou em `--saida`).
- **Instalação:** o script instala `faster-whisper` na primeira vez, se faltar.
- **Modelo:** `small` é o padrão. Use `medium` ou `large-v3` quando a qualidade importar mais que o tempo, e `tiny` para testes.
- **Idioma:** informe com `--idioma` (es, pt, en…). Sem ele, o Whisper detecta sozinho.

## Rede e alternativas
- O modelo é baixado do Hugging Face na primeira vez. No Claude Code na nuvem, libere `huggingface.co` e `*.hf.co` em **Network access** e abra uma sessão nova.
- Sem rede, passe `--modelo-dir` com um modelo já baixado (pasta do CTranslate2).
- Se nada disso der, use:
  - os tempos que a narração da HeyGen já devolve (`create_speech_without_player`);
  - ou o ElevenLabs `creative_transcribe_audio` (gasta créditos; avise o custo antes).

## Como o agente usa
- **Referência enviada:** transcreva e monte a ficha da referência (gancho, estrutura, ritmo de palavras por segundo, CTA). Ela serve de inspiração, nunca de cópia.
- **Vídeo gravado pela pessoa:** passe o `.words.json` para `tighten.py`, para os templates (`at('palavra', n)`) e para `srt.py`.
- **Conferência:** compare o texto transcrito com o roteiro aprovado antes de renderizar.
