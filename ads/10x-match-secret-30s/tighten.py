import json,subprocess,sys,re
# silences (start,end) detected at -40dB/0.16s on vo_raw.mp3
out=subprocess.run(['ffmpeg','-hide_banner','-i','vo_raw.mp3','-af','silencedetect=n=-40dB:d=0.16','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([0-9.]+)',out)]; en=[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',out)]
sil=list(zip(st,en)); DUR=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","vo_raw.mp3"],capture_output=True,text=True).stdout)
keep=[] # source segments to keep
cur=0.0
for i,(a,b) in enumerate(sil):
    d=b-a
    if a<=0.001: k=0.05
    elif b>=DUR-0.01: k=0.10
    elif d>0.40: k=0.40
    else: k=0.19
    k=min(k,d)
    # keep audio up to a + k/2, resume at b - k/2
    keep.append((cur,a+k/2)); cur=b-k/2
keep.append((cur,DUR))
keep=[(max(0,a),b) for a,b in keep if b-a>0.005]
total=sum(b-a for a,b in keep)
TARGET=27.4
tempo=max(1.0,total/TARGET)
print('tightened',round(total,3),'tempo',round(tempo,4),'final',round(total/tempo,3),file=sys.stderr)
def mp(t):
    acc=0.0
    for a,b in keep:
        if t<a: return acc/tempo
        if t<=b: return (acc+t-a)/tempo
        acc+=b-a
    return acc/tempo
words=json.load(open('words.json'))
outw=[]
for w in words:
    if w['word'].startswith('<'): continue
    outw.append({'word':w['word'],'start':round(mp(w['start'])+0.15,3),'end':round(mp(w['end'])+0.15,3)})
json.dump(outw,open('../public/words.json','w'),indent=0)
parts=[];labels=[]
for i,(a,b) in enumerate(keep):
    parts.append(f"[0]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={max(0,b-a-0.012):.4f}:d=0.012[s{i}]"); labels.append(f"[s{i}]")
fc=';'.join(parts)+';'+''.join(labels)+f"concat=n={len(keep)}:v=0:a=1,atempo={tempo:.4f},adelay=150,apad=pad_dur=0.6[o]"
open('fc.txt','w').write(fc)
