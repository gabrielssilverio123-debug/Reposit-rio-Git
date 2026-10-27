#!/usr/bin/env python3
"""Melhor tomada: keep only the best (last complete) take of each script sentence.

When someone records the same line several times, the last full attempt is usually the
good one. This matches each sentence of the script against the word-level transcript of
the raw footage, keeps the last take whose words match well, and cuts the video to those
segments in script order.

Usage:
  takes.py --video raw.mp4 --words raw_words.json --script script.txt --out cut.mp4 \
           --words-out cut_words.json [--min-score 0.75] [--pad 0.08]

raw_words.json: [{"word","start","end"}] for the raw footage (ElevenLabs Scribe,
creative_transcribe_audio, or any word-level transcription).
Prints each sentence with the take chosen and its score; sentences without a good
match are reported and skipped, so review them before rendering.
"""
import argparse
import difflib
import json
import re
import subprocess


def norm(w):
    return re.sub(r"[^a-z0-9']", '', w.lower())


def sentences(text):
    parts = re.split(r'(?<=[.!?…])\s+', text.strip())
    return [[norm(w) for w in p.split() if norm(w)] for p in parts if p.strip()]


def best_take(sent, words, min_score):
    toks = [norm(w['word']) for w in words]
    n = len(sent)
    best = None
    for size in range(max(1, n - 2), n + 3):
        for i in range(0, len(toks) - size + 1):
            score = difflib.SequenceMatcher(None, sent, toks[i:i + size]).ratio()
            # Prefer later takes: on equal or near-equal score, the later one wins.
            if score >= min_score and (best is None or score > best[0] + 0.05 or (score >= best[0] - 0.05 and i >= best[1])):
                best = (score, i, i + size - 1)
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--video', required=True)
    ap.add_argument('--words', required=True)
    ap.add_argument('--script', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--words-out', required=True)
    ap.add_argument('--min-score', type=float, default=0.75)
    ap.add_argument('--pad', type=float, default=0.08, help='seconds kept before/after each take')
    a = ap.parse_args()

    words = [w for w in json.load(open(a.words)) if not w['word'].startswith('<')]
    segs, out_words, t = [], [], 0.0
    for sent in sentences(open(a.script).read()):
        b = best_take(sent, words, a.min_score)
        if not b:
            print(f'NO GOOD TAKE  · {" ".join(sent)}')
            continue
        score, i, j = b
        s, e = max(0.0, words[i]['start'] - a.pad), words[j]['end'] + a.pad
        print(f'take @ {s:7.2f}s  score {score:.2f} · {" ".join(sent)}')
        for w in words[i:j + 1]:
            out_words.append({'word': w['word'], 'start': round(t + w['start'] - s, 3), 'end': round(t + w['end'] - s, 3)})
        segs.append((s, e))
        t += e - s
    if not segs:
        raise SystemExit('no sentence matched; check the transcript and --min-score')

    parts, labels = [], []
    for k, (s, e) in enumerate(segs):
        parts.append(f'[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{k}];'
                     f'[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={max(0, e - s - 0.015):.3f}:d=0.015[a{k}]')
        labels.append(f'[v{k}][a{k}]')
    fc = ';'.join(parts) + ';' + ''.join(labels) + f'concat=n={len(segs)}:v=1:a=1[v][a]'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.video, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-c:a', 'aac', '-b:a', '256k', a.out], check=True)
    json.dump(out_words, open(a.words_out, 'w'), indent=0)
    print(f'{len(segs)} takes · {t:.2f}s → {a.out} and {a.words_out}')


if __name__ == '__main__':
    main()
