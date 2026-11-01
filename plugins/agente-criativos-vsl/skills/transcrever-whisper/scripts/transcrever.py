#!/usr/bin/env python3
"""Transcreve áudio ou vídeo com Whisper (faster-whisper) e grava tempos por palavra.

Uso: transcrever.py <arquivo> [--saida pasta] [--idioma es] [--modelo small] [--modelo-dir pasta]

Saídas (na pasta de saída, com o nome do arquivo):
  <nome>.words.json  lista [{word, start, end}] (o mesmo formato que os templates Remotion leem)
  <nome>.srt         legenda por frase
  <nome>.txt         texto corrido
"""
import argparse
import json
import os
import subprocess
import sys


def garantir_faster_whisper():
    try:
        import faster_whisper  # noqa: F401
    except ImportError:
        print('Instalando faster-whisper (uma vez)…', file=sys.stderr)
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', 'faster-whisper'])


def ts(t):
    ms = int(round(t * 1000))
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('arquivo')
    ap.add_argument('--saida', default=None)
    ap.add_argument('--idioma', default=None, help='es, pt, en… (vazio = detecta)')
    ap.add_argument('--modelo', default='small', help='tiny, base, small, medium, large-v3')
    ap.add_argument('--modelo-dir', default=None, help='pasta de um modelo já baixado (sem rede)')
    a = ap.parse_args()

    garantir_faster_whisper()
    from faster_whisper import WhisperModel

    saida = a.saida or os.path.dirname(os.path.abspath(a.arquivo))
    os.makedirs(saida, exist_ok=True)
    nome = os.path.splitext(os.path.basename(a.arquivo))[0]

    try:
        model = WhisperModel(a.modelo_dir or a.modelo, device='cpu', compute_type='int8')
    except Exception as e:  # download do modelo bloqueado ou sem rede
        sys.exit(
            f'Não consegui carregar o modelo "{a.modelo}": {e}\n'
            'O modelo vem do Hugging Face. Libere huggingface.co e *.hf.co na rede, '
            'ou passe --modelo-dir com um modelo já baixado. Alternativa: ElevenLabs creative_transcribe_audio.'
        )

    segs, info = model.transcribe(a.arquivo, language=a.idioma, word_timestamps=True, vad_filter=True)
    words, frases = [], []
    for s in segs:
        frases.append((s.start, s.end, s.text.strip()))
        for w in s.words or []:
            words.append({'word': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)})

    base = os.path.join(saida, nome)
    json.dump(words, open(base + '.words.json', 'w'), ensure_ascii=False, indent=1)
    with open(base + '.srt', 'w') as f:
        for i, (s, e, t) in enumerate(frases, 1):
            f.write(f'{i}\n{ts(s)} --> {ts(e)}\n{t}\n\n')
    open(base + '.txt', 'w').write(' '.join(t for _, _, t in frases) + '\n')
    print(f'idioma {info.language} · {len(words)} palavras · {len(frases)} frases → {base}.words.json / .srt / .txt')


if __name__ == '__main__':
    main()
