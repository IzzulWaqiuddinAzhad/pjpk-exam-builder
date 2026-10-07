from pathlib import Path
import json,html
import fitz
r=Path(__file__).parent;a=r/'dist/assets';b=json.loads((a/'bank.json').read_text());qs={q['id']:q for t in b['topics'] for q in t['questions']}
W,H=1200,340
base='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="340" viewBox="0 0 1200 340"><rect width="1200" height="340" fill="white"/><g fill="none" stroke="black" stroke-width="3">'
def line(x,y,X,Y,dash=''):return f'<path d="M{x} {y} L{X} {Y}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
def text(x,y,s,size=28):return f'<text x="{x}" y="{y}" fill="black" stroke="none" font-family="Arial,sans-serif" font-size="{size}" text-anchor="middle">{html.escape(str(s))}</text>'
def box(x,y,w,h,label):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4"/>'+text(x+w/2,y+h/2+10,label)
def arrow(x,y,X,Y):
 import math
 ang=math.atan2(Y-y,X-x);pts=[]
 for d in [-.5,.5]:pts.append((X-15*math.cos(ang+d),Y-15*math.sin(ang+d)))
 return line(x,y,X,Y)+line(*pts[0],X,Y)+line(*pts[1],X,Y)
def circle(x,y,label):return f'<circle cx="{x}" cy="{y}" r="22" fill="white"/>'+text(x,y+9,label,25)
def save(name,body,qid,stem=None):
 s=base+body+'</g></svg>';(a/f'Rajah_{name}.svg').write_text(s);fitz.open(stream=s.encode(),filetype='svg')[0].get_pixmap(matrix=fitz.Matrix(2,2)).save(a/f'Rajah_{name}.png')
 qs[qid]['diagram']=name
 if stem:qs[qid]['stem']=stem
# Sequence stimulus: the task is to order, arrows are deliberately absent.
s=text(600,45,'Tiga tindakan dalam kemahiran hambur')+box(55,95,340,145,'P: Hambur dan putar')+box(430,95,340,145,'Q: Lonjak dua kaki')+box(805,95,340,145,'R: Mendarat di peti')+text(600,290,'Susunan kotak bukan urutan perlakuan.',23)
save('V2A',s,'T2-PJ-01-N03','Rajah menunjukkan tiga tindakan dalam hambur dengan putaran 180°. Apakah urutan yang betul?')
s=line(120,75,1050,75)+text(600,47,'GARISAN GOL LAWAN')+arrow(1020,270,1020,115)+text(1030,310,'Arah serangan',23)+circle(580,180,'P')+circle(580,110,'Q')+circle(380,260,'R')+text(280,110,'Q dan R bebas',25)
save('V2B',s,'T2-PJ-04-N02','P menghadap garisan gol lawan seperti rajah. Q dan R bebas. Kepada siapakah P boleh membuat hantaran yang dibenarkan?')
s=text(600,50,'Bacaan lipatan kulit pada tempat yang sama')+box(140,100,300,120,'Ulangan 1: 8 mm')+box(450,100,300,120,'Ulangan 2: 12 mm')+box(760,100,300,120,'Ulangan 3: 10 mm')+text(600,285,'Prosedur: ambil tiga bacaan dan tentukan ukuran penengah.',23)
save('V2C',s,'T2-PJ-11-N02','Berdasarkan bacaan dalam rajah, apakah ukuran penengah yang perlu direkodkan?')
s=text(600,45,'Aktiviti Kijang Mantap — semua turutan lompatan sah')+box(180,90,250,60,'Murid')+box(430,90,300,60,'Tanda lonjakan')+box(730,90,300,60,'Tanda pendaratan')+box(180,150,250,65,'P')+box(430,150,300,65,'2')+box(730,150,300,65,'8')+box(180,215,250,65,'Q')+box(430,215,300,65,'4')+box(730,215,300,65,'9')
save('V2D',s,'T3-PJ-09-N05','Jadual menunjukkan pencapaian Kijang Mantap. Kedua-dua murid mengikut urutan kemahiran yang betul. Siapakah mendapat skor lebih tinggi?')
s=text(600,50,'Pemerhatian semasa kemarahan')+box(130,100,430,130,'Tanda P: Berpeluh')+box(630,100,430,130,'Tanda Q: Bercakap kuat')+text(600,290,'Kelaskan tanda mengikut jadual perubahan dalam buku teks.',23)
save('V2E',s,'T3-PK-15-N02','Bagaimanakah tanda P dan Q dalam rajah dikelaskan menurut jadual buku teks?')
s=text(600,45,'Petikan nilai jadual buku teks — lelaki, umur 13–15 tahun')+box(160,100,440,65,'Sederhana aktif')+box(600,100,440,65,'Aktif')+box(160,165,440,80,'2210 kalori')+box(600,165,440,80,'2480 kalori')+text(600,300,'Nilai untuk latihan mentafsir jadual, bukan pelan diet individu.',22)
save('V2F',s,'T3-PK-20-N02','Berdasarkan nilai jadual dalam rajah, berapakah perbezaan keperluan kalori antara kedua-dua tahap aktiviti?')
s=text(600,35,'Susunan pemain padang (penjaga gol tidak ditunjukkan)')
for x,ys in [(300,[100,180,260]),(600,[70,120,170,220,270]),(900,[120,220])]:
 for y in ys:s+=circle(x,y,'')
s+=text(300,315,'Pertahanan',23)+text(600,315,'Tengah',23)+text(900,315,'Penyerang',23)
save('V2G',s,'T4-PJ-02-N01','Rajah menunjukkan susunan pemain padang dalam satu formasi bola sepak. Apakah susunan itu?')
s=text(310,40,'Regu P')+text(890,40,'Regu Q')
for left in [80,660]:s+=f'<rect x="{left}" y="65" width="470" height="230"/>'+line(left,100,left+470,100,'8 6')
for x in [200,310,420]:s+=circle(x,140,'')
for x,y in [(890,140),(780,245),(1000,245)]:s+=circle(x,y,'')
s+=text(600,90,'Jaring',20)+text(600,325,'Q: seorang mengadang, dua pemain meliputi ruang belakang',23)
save('V2H',s,'T4-PJ-06-N05','Rajah menunjukkan dua susunan pertahanan sepak takraw. Mengapakah susunan Q lebih memenuhi gabungan strategi mengadang dan menerima bola?')
s=text(600,45,'Keputusan Explore Race')+box(90,90,200,60,'Pasukan')+box(290,90,340,60,'Tugasan lengkap')+box(630,90,470,60,'Tiba di checkpoint akhir')+box(90,150,200,65,'P')+box(290,150,340,65,'Tidak')+box(630,150,470,65,'Pertama')+box(90,215,200,65,'Q')+box(290,215,340,65,'Ya; patuh peraturan')+box(630,215,470,65,'Kedua')
save('V2I',s,'T4-PJ-09-N02','Pasukan P tiba dahulu seperti jadual. Adakah pasukan P memenuhi semua syarat kemenangan dalam Explore Race?')
s=text(600,42,'Pergerakan M3 dan M4 dalam pass and go')+circle(160,200,'M3')+circle(600,100,'M4')+circle(1030,200,'M3')+arrow(205,180,555,108)+text(350,115,'1. Hantar',23)+arrow(600,135,985,195)+text(860,125,'3. Hantar kembali',23)+arrow(210,250,975,250)+text(600,295,'2. M3 berlari melepasi pertahanan',23)
save('V2J',s,'T5-PJ-03-N05','Rajah menunjukkan urutan lengkap satu-dua. Mengapakah pemain yang hanya menghantar kemudian berhenti belum melengkapkan corak ini?')
qs['T5-PJ-03-N05']['correct']='Corak memerlukan gabungan hantaran, pergerakan dan hantaran kembali'
# Existing options still contain correct; no answer edits needed.
s=text(600,48,'Maklumat pemukul untuk pemilihan posisi pemadang')+box(80,110,480,130,'P: Pukulan kuat dan jauh')+box(640,110,480,130,'Q: Tampanan pendek')+text(600,300,'Pilih liputan zon berdasarkan jangkaan pukulan.',24)
save('V2K',s,'T5-PJ-07-N05','Berdasarkan maklumat pemukul P dan Q, mengapakah posisi pemadang perlu disesuaikan?')
s=text(600,42,'Contoh struktur latihan')+box(45,100,250,115,'Kerja')+box(330,100,250,115,'Pemulihan aktif')+box(615,100,250,115,'Kerja')+box(900,100,250,115,'Pemulihan aktif')
for x in [295,580,865]:s+=arrow(x+3,156,x+31,156)
s+=text(600,285,'Siri kerja dan pemulihan diulang mengikut pelan latihan.',23)
save('V2L',s,'T5-PJ-09-N03','Rajah menunjukkan struktur latihan dengan larian perlahan dan striding pada fasa kerja. Apakah jenis latihan yang sepadan?')
(a/'bank.json').write_text(json.dumps(b,ensure_ascii=False,indent=2));print('12 original SVG + PNG diagrams added')
