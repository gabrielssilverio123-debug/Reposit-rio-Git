#!/usr/bin/env python3
"""Shorten long pauses in a voiceover and remap its word timestamps.

Usage:
  tighten.py --audio vo_raw.mp3 --words words.json --out public/vo.wav \
             --words-out public/words.json [--target 27.5] [--short 0.17] [--long 0.30] \
             [--video raw.mp4 --video-out public/presenter.mp4]

words.json: [{"word": "...", "start": 0.12, "end": 0.40}, ...] (timestamps of the raw audio).
Silences are detected with ffmpeg (-40 dBFS, >= 0.16 s). Each silence keeps `--short`
seconds (or `--long` when the original pause was longer than 0.4 s). If the result is
still longer than --target, it is sped up with atempo (pitch preserved).
With --video (footage whose audio is --audio, e.g. the same .mp4 twice), the same cuts are
applied to the picture and --video-out gets the cut video with the cut audio ("Corta as pausas").
"""
import argparse
import json
import re
import subprocess


def detect_silences(audio):
    err = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', audio, '-af', 'silencedetect=n=-40dB:d=0.16', '-f', 'null', '-'],
        capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', err)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', err)]
    return list(zip(starts, ends))


def duration(audio):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio],
                         capture_output=True, text=True).stdout
    return float(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--audio', required=True)
    ap.add_argument('--words', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--words-out', required=True)
    ap.add_argument('--target', type=float, default=0.0, help='max seconds of speech (0 = no limit)')
    ap.add_argument('--short', type=float, default=0.17)
    ap.add_argument('--long', type=float, default=0.30)
    ap.add_argument('--delay', type=float, default=0.0, help='seconds of silence before the voice')
    ap.add_argument('--video', help='footage to cut with the same segments (its audio is --audio)')
    ap.add_argument('--video-out', help='output for the cut footage (requires --video)')
    a = ap.parse_args()

    total_dur = duration(a.audio)
    keep, cur = [], 0.0
    for s, e in detect_silences(a.audio):
        d = e - s
        if s <= 0.001:
            k = 0.05
        elif e >= total_dur - 0.01:
            k = 0.10
        elif d > 0.40:
            k = a.long
        else:
            k = a.short
        k = min(k, d)
        keep.append((cur, s + k / 2))
        cur = e - k / 2
    keep.append((cur, total_dur))
    keep = [(max(0.0, s), e) for s, e in keep if e - s > 0.005]
    length = sum(e - s for s, e in keep)
    tempo = max(1.0, length / a.target) if a.target else 1.0

    def remap(t):
        acc = 0.0
        for s, e in keep:
            if t < s:
                return acc / tempo
            if t <= e:
                return (acc + t - s) / tempo
            acc += e - s
        return acc / tempo

    words = [w for w in json.load(open(a.words)) if not w['word'].startswith('<')]
    out_words = [{'word': w['word'], 'start': round(remap(w['start']) + a.delay, 3),
                  'end': round(remap(w['end']) + a.delay, 3)} for w in words]
    json.dump(out_words, open(a.words_out, 'w'), indent=0)

    parts, labels = [], []
    for i, (s, e) in enumerate(keep):
        fade_out = max(0.0, e - s - 0.012)
        parts.append(f'[0]atrim={s:.4f}:{e:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,'
                     f'afade=t=out:st={fade_out:.4f}:d=0.012[s{i}]')
        labels.append(f'[s{i}]')
    chain = f"concat=n={len(keep)}:v=0:a=1,atempo={tempo:.4f}"
    if a.delay:
        chain += f",adelay={int(a.delay * 1000)}"
    fc = ';'.join(parts) + ';' + ''.join(labels) + chain + ',apad=pad_dur=0.3[o]'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.audio, '-filter_complex', fc,
                    '-map', '[o]', '-ar', '48000', '-ac', '1', a.out], check=True)
    if a.video and a.video_out:
        vparts, vlabels = [], []
        for i, (s, e) in enumerate(keep):
            vparts.append(f'[0:v]trim={s:.4f}:{e:.4f},setpts=PTS-STARTPTS[v{i}]')
            vlabels.append(f'[v{i}]')
        vfc = ';'.join(vparts) + ';' + ''.join(vlabels) + f'concat=n={len(keep)}:v=1:a=0,setpts=PTS/{tempo:.4f}'
        if a.delay:
            vfc += f',tpad=start_duration={a.delay}:start_mode=clone'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.video, '-i', a.out, '-filter_complex', vfc + '[v]',
                        '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
                        '-c:a', 'aac', '-b:a', '256k', '-shortest', a.video_out], check=True)
        print(f'cut footage -> {a.video_out}')
    print(f'speech {length:.2f}s -> {length / tempo:.2f}s (tempo {tempo:.3f}); wrote {a.out} and {a.words_out}')


if __name__ == '__main__':
    main()
