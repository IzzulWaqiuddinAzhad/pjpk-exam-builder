"""Attach curriculum context and diagrams after any question-bank rebuild."""
from pathlib import Path
import json, runpy
r=Path(__file__).parent
p=r/'dist/assets/bank.json';b=json.loads(p.read_text());refs=json.loads((r/'authoring/curriculum-map.json').read_text())
b['topics']=[t for t in b['topics'] if t['form'] in [2,3,4,5]]
for t in b['topics']:
 if t['id'] in refs:t['curriculum']=refs[t['id']]
b['reviewNote']='Bukti jawapan merujuk halaman buku teks. Rujukan DSKP disemak pada peringkat topik. Soalan objektif menilai pengetahuan, bukan penguasaan amali. Aras Bloom dan kesukaran ialah anggaran reka bentuk.'
p.write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n')
runpy.run_path(str(r/'make_diagrams.py'))
