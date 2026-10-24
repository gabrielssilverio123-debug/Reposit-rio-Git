#!/usr/bin/env python3
"""Build a sentence-level .srt from word timestamps.

Usage: srt.py words.json out.srt [--offset 0.167]
--offset: seconds the voice is delayed in the final video (e.g. VO_START frames / fps).
"""
import argparse
import json


def ts(t):
    ms = int(round(t * 1000))
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('words')
    ap.add_argument('out')
    ap.add_argument('--offset', type=float, default=0.0)
    a = ap.parse_args()

    words = json.load(open(a.words))
    sentences, cur = [], []
    for w in words:
        cur.append(w)
        if w['word'].rstrip('"”').endswith(('.', '?', '!', '…', ':')):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)

    blocks = []
    for i, s in enumerate(sentences):
        start = s[0]['start'] + a.offset
        end = s[-1]['end'] + a.offset + 0.15
        if i + 1 < len(sentences):
            end = min(end, sentences[i + 1][0]['start'] + a.offset - 0.02)
        blocks.append(f"{i + 1}\n{ts(start)} --> {ts(end)}\n{' '.join(x['word'] for x in s)}\n")
    open(a.out, 'w').write('\n'.join(blocks))
    print(f'wrote {len(blocks)} subtitles to {a.out}')


if __name__ == '__main__':
    main()
