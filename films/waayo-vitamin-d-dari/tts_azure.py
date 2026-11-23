# Voice each line with Azure fa-IR-FaridNeural (the Dari version) (key injected by the session proxy).
import json, subprocess, sys, os, numpy as np, soundfile as sf
from xml.sax.saxutils import escape
lines=json.load(open(sys.argv[1])); out=sys.argv[2]; rate=os.environ.get("RATE","+4%")
os.makedirs(out,exist_ok=True); dur={}
for L in lines:
    txt=escape(L.get("say",L["text"]))
    ssml=f"<speak version='1.0' xml:lang='fa-IR'><voice name='fa-IR-FaridNeural'><prosody rate='{rate}'>{txt}</prosody></voice></speak>"
    raw=f"{out}/{L['id']}.raw.wav"
    code=subprocess.run(["curl","-sS","-o",raw,"-w","%{http_code}","-X","POST",
      "https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1",
      "-H","Ocp-Apim-Subscription-Key: proxy-injected","-H","Content-Type: application/ssml+xml",
      "-H","X-Microsoft-OutputFormat: riff-24khz-16bit-mono-pcm","-H","User-Agent: film-tts",
      "--data-binary",ssml],capture_output=True,text=True).stdout
    if code!="200": sys.exit(f"{L['id']}: HTTP {code}")
    a,sr=sf.read(raw); os.remove(raw)
    thr=10**(-45/20); idx=np.where(np.abs(a)>thr)[0]
    a=a[max(0,idx[0]-int(.03*sr)):idx[-1]+int(.08*sr)]
    sf.write(f"{out}/{L['id']}.wav",a,sr); dur[L['id']]=round(len(a)/sr,3)
    print(L['id'],dur[L['id']])
json.dump(dur,open(f"{out}/dur.json","w"),indent=1); print("total",round(sum(dur.values()),2))
