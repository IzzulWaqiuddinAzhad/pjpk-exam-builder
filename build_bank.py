import json,hashlib,re
from pathlib import Path
import fitz
from PIL import Image
r=Path(__file__).parent;root=r.parent
b=json.loads((r/'dist/assets/bank.json').read_text());b['books'].pop('1',None);b['dskp'].pop('1',None)
b['version']='2.0';b['reviewNote']='Bukti halaman disemak terhadap buku teks yang dimuat naik. Kesukaran ialah anggaran reka bentuk. SP yang dipetik daripada buku teks belum disahkan secara berasingan terhadap DSKP.'
for t in b['topics']:t['questions']=[q for q in t['questions'] if '-N' not in q['id']]
ev=r/'dist/assets/evidence';ev.mkdir(exist_ok=True)
records=[]
for f in range(2,6):
 pdf=next((root/'upload').glob(f'{6-f:02d}-*.pdf'));doc=fitz.open(pdf);digest=hashlib.sha256(pdf.read_bytes()).hexdigest()
 groups=json.loads((r/f'authoring/t{f}.json').read_text())
 for group in groups:
  t=next(t for t in b['topics'] if t['id']==group['topic']);page=doc[group['pdf']-1]
  name=f'T{f}-pdf-{group["pdf"]}.jpg'
  pix=page.get_pixmap(matrix=fitz.Matrix(1.55,1.55),alpha=False)
  img=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);img.save(ev/name,'JPEG',quality=89,optimize=True)
  for j,row in enumerate(group['items']):
   stem,correct,w1,w2,w3,reason,bloom,difficulty=row
   id=f'{t["id"]}-N{j+1:02d}'
   wrong=[w1,w2,w3];i=(f+len(records))%4;options=wrong.copy();options.insert(i,correct)
   q={'id':id,'number':0,'stem':stem,'correct':correct,'wrong':wrong,'options':options,'answer':'ABCD'[i],'reason':reason,'bloom':bloom,'difficulty':difficulty,'reviewStatus':'evidence-checked','reference':f'Buku teks T{f}, hlm. {group["pages"]} (PDF {group["pdf"]})','evidence':{'printedPages':group['pages'],'pdfPage':group['pdf'],'sp':group['sp'],'snippets':[name],'explanation':reason,'edition':b['books'][str(f)][0],'isbn':b['books'][str(f)][1]},'sourceScope':'textbook-edition','authored':'2026-10-06'}
   t['questions'].append(q);records.append({'id':id,'form':f,'printedPages':group['pages'],'pdfPage':group['pdf'],'sp':group['sp'],'sourceFile':pdf.name,'sourceSha256':digest})
 n=0
 for t in b['topics']:
  if t['form']==f:
   for q in t['questions']:n+=1;q['number']=n
(r/'dist/assets/bank.json').write_text(json.dumps(b,ensure_ascii=False,indent=2))
(r/'authoring/source-map.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('items',sum(len(t['questions']) for t in b['topics']),'new',len(records),'evidence previews',len(list(ev.glob('*.jpg'))))

import runpy
runpy.run_path(str(r/"finalize_bank.py"))
