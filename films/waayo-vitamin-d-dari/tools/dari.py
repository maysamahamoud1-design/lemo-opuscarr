# After tools/splice.py: turn the Somali film.js into the Dari one: labels and titles in Dari, timing cues mapped to the
# Dari words, right-to-left karaoke captions, Persian punctuation, and no letter spacing (it breaks joined letters).
import os, re
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
s = open(f'{H}/film.js').read()
def rep(x, y, n=None):
    global s
    c = s.count(x); assert c and (n is None or c == n), (x[:60], c); s = s.replace(x, y)
# the cue words the cards are timed to → the matching Dari words
KEY = {
 's01': {'haddaba': 'پس', 'qurbaha': 'خارج', 'yaraanta': 'کمبود'},
 's02': {'sameeyaa': 'می‌سازد.', 'fiitamiin#1': 'ویتامین#1', 'xoojiyaa': 'قوی', 'murqaha': 'عضلات'},
 's03': {'qorrax': 'آفتاب', 'isla': 'همان'},
 's04': {'uk': 'بریتانیا', 'norway': 'ناروی', 'canada': 'کانادا', 'soomaali': 'سومالیایی', 'qorraxdu': 'آفتاب', 'xilliga': 'فصل'},
 's05': {'gudaha': 'خانه', 'yareeyaan': 'کمتر'},
 's06': {'daal': 'خستگی', 'lafaha': 'درد', 'carruurtana': 'نرمی'},
 's07': {'baaritaanka': 'آزمایش', 'kiniinnada': 'قرص', 'gaar': 'به‌ویژه', 'xilliga': 'فصل'},
 's08': {'maxaad': 'می‌خواهید'},
 's09': {'like': 'لایک', 'subscribe': 'سبسکرایب'},
}
import json
rep("  const wt = (id, p, n = 0) => {",
    "  const KEY = " + json.dumps(KEY, ensure_ascii=False) + ";\n  const wt = (id, p, n = 0) => {\n    { const k = (KEY[id] || {})[p + (n ? '#' + n : '')]; if (k) { const [w, m] = k.split('#'); p = w; n = +(m || 0); } }", 1)
# titles and labels
T = [("'WAAYO?'", "'چرا؟'"), ("'MAQAARKA MADOW'", "'پوست تیره'"), ("'MAQAARKA'", "'پوست'"), ("'FIITAMIIN D'", "'ویتامین D'"),
     ("'LAFO & MURQO'", "'استخوان و عضله'"), ("'QORRAX KA BADAN'", "'آفتاب بیشتر'"), ("'QURBAHA'", "'خارج از کشور'"),
     ("'QORRAX DACIIF'", "'آفتاب ضعیف'"), ("'XILLIGA QABOWGA'", "'فصل سرما'"), ("'DHAR'", "'لباس'"), ("'GUDAHA'", "'خانه'"),
     ("'YARAANTA D'", "'کمبود D'"), ("'CALAAMADAHA'", "'نشانه‌ها'"), ("'BAARITAAN DHIIG'", "'آزمایش خون'"), ("'KINIINNO D'", "'قرص D'"),
     ("'LIKE & SUBSCRIBE'", "'لایک و سبسکرایب'"), ("'SUBSCRIBE'", "'سبسکرایب'"), ("'DAAL'", "'خستگی'"), ("'XANUUN'", "'درد'"),
     ("'LAFO JILICSAN'", "'نرمی استخوان'"), ("'RICKETS'", "'راشیتیسم'"), ("'UK'", "'بریتانیا'"), ("'NORWAY'", "'ناروی'"), ("'CANADA'", "'کانادا'"),
     ("'Talo caafimaad'", "'مشورهٔ طبی'"), ("'maaha.'", "'نیست.'"), ("'La tasho dhakhtarkaaga.'", "'با داکتر خود مشوره کنید.'"),
     ("const KICK = 'SOOMAALIDA QURBAHA · FIITAMIIN D';", "const KICK = 'سومالیایی‌های مهاجر · ویتامین D';"),
     ("'WAAYO? · FIITAMIIN D'", "'چرا؟ · ویتامین D'")]
for a, b in T: rep(a, b)
# Persian punctuation ends a caption chunk too
rep("punct = /[,.…?]$/.test(x.w)", "punct = /[,.…?،؟؛!]$/.test(x.w)")
# right-to-left caption lines: words laid out from the right edge
rep("let x = CX - lw / 2;", "let x = CX + lw / 2;")
rep("const ww = ctx.measureText(w.w).width,", "const ww = ctx.measureText(w.w).width, _x = (x -= ww),")
rep("        x += ww + sp;", "        x -= sp;")
# no letter spacing: it breaks the joins between Persian letters
s = re.sub(r"letterSpacing = '[-0-9.]+px'", "letterSpacing = '0px'", s)
s = re.sub(r"ls: '[-0-9.]+px'", "ls: '0px'", s)
s = s.replace("// Waayo? · Fiitamiin D: the film", "// Waayo? · Fiitamiin D (Dari, voice: Farid): the film")
open(f'{H}/film.js', 'w').write(s); print('dari patches applied')
