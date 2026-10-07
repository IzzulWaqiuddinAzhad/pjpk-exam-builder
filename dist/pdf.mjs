import {selectionStats,BLOOM} from './core.mjs';
const PAGE=[595.28,841.89],M=45,WIDTH=PAGE[0]-M*2;
// Standard embedded PDF fonts support Malay text and printable Western punctuation.
export function printable(text){return String(text??'').replace(/−/g,'-').replace(/→/g,' ke ').replace(/\t/g,' ').replace(/[\u0000-\u0008\u000b-\u001f]/g,'').replace(/[^\x20-\x7e\xa0-\xff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u2014\u2018-\u201a\u201c-\u201e\u2020-\u2022\u2026\u2030\u2039\u203a\u20ac\n]/g,'?');}
export function wrap(text,font,size,width){const all=[];for(const para of printable(text).split('\n')){if(!para){all.push('');continue;}let line='';for(const word of para.split(/\s+/)){if(font.widthOfTextAtSize((line?line+' ':'')+word,size)<=width){line+=(line?' ':'')+word;continue;}if(line){all.push(line);line='';}if(font.widthOfTextAtSize(word,size)<=width){line=word;continue;}for(const char of word){if(font.widthOfTextAtSize(line+char,size)>width){all.push(line);line='';}line+=char;}}all.push(line);}return all;}
function normaliseMeta(meta){const out={};for(const key of ['school','title','year','duration','teacher','reviewedBy','approvedBy','teacherRole','reviewedRole','approvedRole','instructions'])out[key]=String(meta[key]||'').replace(/\s+/g,' ').trim();out.cover=Boolean(meta.cover);out.evidenceAppendix=Boolean(meta.evidenceAppendix);out.logoDataUrl=meta.logoDataUrl||null;return out;}
export function examCode(items,meta){let h=2166136261;const text=items.map(q=>q.id+q.stem+q.options.join('|')+q.answer).join(',')+JSON.stringify(normaliseMeta(meta));for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0').toUpperCase();}
export async function createExamPDFs(items,meta,{PDFLib=globalThis.PDFLib,loadEvidence=async name=>{const r=await fetch(new URL('./assets/evidence/'+name,import.meta.url));if(!r.ok)throw Error('Pratonton bukti tidak dapat dimuatkan. Cuba tanpa lampiran atau muat semula halaman.');return new Uint8Array(await r.arrayBuffer());},loadImage=async name=>{const r=await fetch(new URL('./assets/Rajah_'+name+'.png',import.meta.url));if(!r.ok)throw Error('Rajah '+name+' tidak dapat dimuatkan.');return new Uint8Array(await r.arrayBuffer());}}={}){
 if(!items.length)throw Error('Pilih sekurang-kurangnya satu soalan.');
 meta=normaliseMeta(meta);
 if(!PDFLib)throw Error('Penjana PDF belum sedia. Muat semula halaman.');
 const {PDFDocument,StandardFonts,rgb}=PDFLib;const black=rgb(0,0,0);const stats=selectionStats(items);const code=examCode(items,meta);const images={};
 await Promise.all([...new Set(items.map(q=>q.diagram).filter(Boolean))].map(async name=>images[name]=await loadImage(name)));
 async function context(title){const doc=await PDFDocument.create();doc.setTitle(title);doc.setAuthor(meta.teacher||'PJPK Studio Peperiksaan');doc.setSubject('Pendidikan Jasmani dan Pendidikan Kesihatan');doc.setCreator('PJPK Studio Peperiksaan');const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);return {doc,regular,bold};}
 function text(page,content,x,y,font,size=11){page.drawText(printable(content),{x,y,font,size,color:black});}
 function para(page,content,x,y,font,size=11,width=WIDTH,leading=size*1.38){const lines=wrap(content,font,size,width);for(const line of lines){if(line)text(page,line,x,y,font,size);y-=leading;}return y;}
 function centre(page,content,y,font,size=12,width=WIDTH){const lines=wrap(content,font,size,width);for(const line of lines){text(page,line,(PAGE[0]-font.widthOfTextAtSize(line,size))/2,y,font,size);y-=size*1.4;}return y;}
 function rule(page,y){page.drawLine({start:{x:M,y},end:{x:PAGE[0]-M,y},thickness:.55,color:black});}
 const formLabel=stats.forms.length===1?'TINGKATAN '+stats.forms[0]:'TINGKATAN '+stats.forms.join(', ');
 function top(ctx,page,teacher=false){text(page,'PENDIDIKAN JASMANI DAN PENDIDIKAN KESIHATAN',M,PAGE[1]-39,ctx.bold,8);text(page,teacher?'SKEMA GURU':formLabel,M,PAGE[1]-53,ctx.regular,8);rule(page,PAGE[1]-63);return PAGE[1]-90;}
 function finish(ctx,label){const pages=ctx.doc.getPages();pages.forEach((page,i)=>{rule(page,48);text(page,`${label} | ${code}`,M,34,ctx.regular,8);const right=`${i+1} / ${pages.length}`;text(page,right,PAGE[0]-M-ctx.regular.widthOfTextAtSize(right,8),34,ctx.regular,8);text(page,'Idea by: Khairul Adham  |  Created by: Izzul Waqiuddin Azhad',M,20,ctx.regular,7.5);});}
 const paper=await context(`${meta.title||'Ujian'} — PJPK — ${code}`);const questionBounds=[];
 if(meta.cover){
  const coverPage=paper.doc.addPage(PAGE);let y=PAGE[1]-58;
  if(meta.logoDataUrl){let logo;try{logo=await paper.doc.embedPng(meta.logoDataUrl);}catch{throw Error('Logo sekolah tidak dapat dibaca. Muat naik semula fail PNG atau JPG.');}const scale=Math.min(82/logo.width,72/logo.height);const w=logo.width*scale,h=logo.height*scale;coverPage.drawImage(logo,{x:(PAGE[0]-w)/2,y:y-h,width:w,height:h});y-=h+18;}
  if(meta.school)y=centre(coverPage,meta.school.toUpperCase(),y,paper.bold,14)-13;
  y=centre(coverPage,(meta.title||'UJIAN').toUpperCase()+' '+(meta.year||''),y,paper.bold,13)-12;
  y=centre(coverPage,'PENDIDIKAN JASMANI',y,paper.bold,15);
  y=centre(coverPage,'DAN PENDIDIKAN KESIHATAN',y,paper.bold,15)-12;
  y=centre(coverPage,formLabel,y,paper.bold,11)-9;
  y=centre(coverPage,`${items.length} soalan  |  ${items.length} markah  |  ${meta.duration||'Tempoh: __________'}`,y,paper.regular,10)-12;
  rule(coverPage,y);y-=27;
  text(coverPage,'Nama: __________________________________________________________',M,y,paper.regular,11);y-=28;
  text(coverPage,'Kelas: _____________________     Tarikh: ___________________________',M,y,paper.regular,11);y-=33;
  text(coverPage,'ARAHAN',M,y,paper.bold,10.5);y-=21;
  for(const instruction of [`Kertas ini mengandungi ${items.length} soalan objektif.`,`Jawab semua soalan.`,`Pilih satu jawapan yang paling tepat bagi setiap soalan.`,`Setiap soalan membawa satu markah.`,`Catat jawapan pada ruangan yang disediakan.`])y=para(coverPage,'• '+instruction,M,y,paper.regular,10.5)-4;
  const signatures=Boolean(meta.teacher||meta.reviewedBy||meta.approvedBy);
  if(meta.instructions){const required=wrap(meta.instructions,paper.regular,10,WIDTH).length*13.8+9;const floor=signatures?260:70;
   if(y-required>=floor)para(coverPage,meta.instructions,M,y-9,paper.regular,10);
   else {text(coverPage,'Arahan tambahan disertakan pada halaman seterusnya.',M,y-8,paper.regular,9);let cp=paper.doc.addPage(PAGE),cy=top(paper,cp);cy=para(cp,'ARAHAN TAMBAHAN',M,cy,paper.bold,12)-15;for(const line of wrap(meta.instructions,paper.regular,11,WIDTH)){if(cy<65){cp=paper.doc.addPage(PAGE);cy=top(paper,cp);}text(cp,line,M,cy,paper.regular,11);cy-=15.2;}}
  }
  if(signatures){const columns=[['Disediakan oleh:',meta.teacher,meta.teacherRole],['Disemak oleh:',meta.reviewedBy,meta.reviewedRole],['Disahkan oleh:',meta.approvedBy,meta.approvedRole]];const gap=20,colWidth=(WIDTH-gap*2)/3;columns.forEach(([label,name,role],index)=>{const x=M+index*(colWidth+gap);text(coverPage,label,x,233,paper.regular,9);coverPage.drawLine({start:{x,y:206},end:{x:x+colWidth-7,y:206},thickness:.55,dashArray:[1.5,2],color:black});let sy=192;if(name)sy=para(coverPage,name,x,sy,paper.bold,8.5,colWidth,11)-3;if(role)para(coverPage,role,x,sy,paper.regular,8,colWidth,10.5);});}
 }

 let page=paper.doc.addPage(PAGE),y=top(paper,page);if(!meta.cover){y=centre(page,`${meta.title||'UJIAN'} ${meta.year||''}`,y,paper.bold,14)-6;if(meta.school)y=centre(page,meta.school,y,paper.regular,11)-6;y=para(page,`${items.length} soalan | ${items.length} markah | ${meta.duration||'Tempoh: __________'}`,M,y,paper.regular,10)-9;y=para(page,'Nama: __________________________________  Kelas: ______________',M,y,paper.regular,10)-9;y=para(page,'Jawab semua soalan. Pilih satu jawapan paling tepat. Setiap soalan membawa satu markah.',M,y,paper.regular,10)-7;if(meta.instructions)y=para(page,meta.instructions,M,y,paper.regular,10)-7;y-=12;}
 const embedded={};for(const name of Object.keys(images))embedded[name]=await paper.doc.embedPng(images[name]);
 for(let i=0;i<items.length;i++){
  const q=items[i],size=11,leading=14.5;const stemLines=wrap(q.stem,paper.bold,size,WIDTH-25);const opts=q.options.map((o,j)=>wrap('ABCD'[j]+'   '+o,paper.regular,size,WIDTH-35));const diagramH=q.diagram?145:0;const height=stemLines.length*leading+8+opts.reduce((a,l)=>a+l.length*leading+2,0)+diagramH+16;
  if(height>PAGE[1]-160)throw Error('Soalan '+q.id+' terlalu panjang untuk satu halaman.');
  if(y-height<59){page=paper.doc.addPage(PAGE);y=top(paper,page);}
  const startY=y;
  if(q.diagram){const img=embedded[q.diagram];const w=480,h=img.height/img.width*w;page.drawImage(img,{x:(PAGE[0]-w)/2,y:y-h+8,width:w,height:h});y-=diagramH;}
  text(page,String(i+1)+'.',M,y,paper.bold,size);for(const line of stemLines){text(page,line,M+25,y,paper.bold,size);y-=leading;}y-=8;
  for(const lines of opts){for(const line of lines){text(page,line,M+25,y,paper.regular,size);y-=leading;}y-=2;}y-=16;questionBounds.push({id:q.id,number:i+1,page:paper.doc.getPageCount(),top:startY,bottom:y});
 }
 // Compact response boxes are appended to the last paper page or a fresh page.
 const columns=5,rows=Math.ceil(items.length/columns),gridHeight=rows*25+46;
 if(gridHeight>620){page=paper.doc.addPage(PAGE);y=top(paper,page);}else if(y-gridHeight<65){page=paper.doc.addPage(PAGE);y=top(paper,page);}else y-=5;
 text(page,'RUANGAN JAWAPAN',M,y,paper.bold,11);y-=25;
 for(let r=0;r<rows;r++){
  if(y-25<60){page=paper.doc.addPage(PAGE);y=top(paper,page);text(page,'RUANGAN JAWAPAN (SAMBUNGAN)',M,y,paper.bold,11);y-=25;}
  for(let col=0;col<columns;col++){const n=r*columns+col+1;if(n>items.length)continue;const x=M+col*(WIDTH/columns);page.drawRectangle({x,y:y-22,width:WIDTH/columns,height:25,borderWidth:.5,borderColor:black});text(page,n+'.',x+7,y-13,paper.regular,9);page.drawLine({start:{x:x+35,y:y-15},end:{x:x+WIDTH/columns-12,y:y-15},thickness:.45,color:black});}y-=25;
 }
 finish(paper,'KERTAS MURID');
 const scheme=await context(`Skema Guru — ${meta.title||'Ujian'} — ${code}`);page=scheme.doc.addPage(PAGE);y=top(scheme,page,true);y=para(page,`${meta.title||'UJIAN'} ${meta.year||''}`,M,y,scheme.bold,15)-6;if(meta.school)y=para(page,meta.school,M,y,scheme.regular,11)-6;y=para(page,`${formLabel} | ${items.length} item | ${items.length} markah`,M,y,scheme.bold,10.5)-7;if(meta.teacher)y=para(page,'Disediakan oleh: '+meta.teacher+(meta.teacherRole?' — '+meta.teacherRole:''),M,y,scheme.regular,10)-7;if(meta.reviewedBy)y=para(page,'Disemak oleh: '+meta.reviewedBy+(meta.reviewedRole?' — '+meta.reviewedRole:''),M,y,scheme.regular,10)-7;if(meta.approvedBy)y=para(page,'Disahkan oleh: '+meta.approvedBy+(meta.approvedRole?' — '+meta.approvedRole:''),M,y,scheme.regular,10)-7;y=para(page,`Agihan: rendah ${stats.low}, sederhana ${stats.medium}, tinggi ${stats.high}. KBAT C4–C5: ${stats.hots}.`,M,y,scheme.regular,10)-12;y=para(page,'1 markah untuk jawapan betul; 0 untuk salah atau kosong. Semak kod kertas pada kaki halaman supaya skema sepadan dengan kertas murid.',M,y,scheme.regular,10)-15;
 text(page,'KUNCI JAWAPAN',M,y,scheme.bold,11);y-=28;
 for(let r=0;r<rows;r++){
  if(y-25<65){page=scheme.doc.addPage(PAGE);y=top(scheme,page,true);}
  for(let col=0;col<columns;col++){const n=r*columns+col;if(n>=items.length)continue;const x=M+col*WIDTH/columns;page.drawRectangle({x,y:y-22,width:WIDTH/columns,height:25,borderWidth:.5,borderColor:black});text(page,String(n+1)+'.',x+8,y-13,scheme.regular,10);text(page,items[n].answer,x+WIDTH/columns-24,y-13,scheme.bold,11);}y-=25;
 }
 page=scheme.doc.addPage(PAGE);y=top(scheme,page,true);y=para(page,'RASIONAL DAN RUJUKAN',M,y,scheme.bold,14)-10;y=para(page,'Item bertanda BUKTI HALAMAN mempunyai rujukan khusus. Item SEMAKAN DIPERLUKAN menggunakan julat topik sahaja. DSKP dirujuk pada peringkat topik; MCQ menilai pengetahuan, bukan amali. Kesukaran ialah anggaran reka bentuk.',M,y,scheme.regular,9.5)-20;
 for(let i=0;i<items.length;i++){
  const q=items[i];const lines=[{t:`${i+1}. ${q.answer} — ${q.correct}`,f:scheme.bold,s:11},{t:q.reason,f:scheme.regular,s:10.5},{t:`T${q.form} | ${q.topic} | ${q.id}`,f:scheme.regular,s:9},{t:`C${q.bloom} ${BLOOM[q.bloom]} | ${q.difficulty} | Buku teks hlm. ${q.evidence?.printedPages||q.pages}${q.evidence?' | PDF '+q.evidence.pdfPage:''}`,f:scheme.regular,s:9},{t:(q.evidence?'BUKTI HALAMAN | SP buku teks: '+(q.evidence.sp||'Tidak dinyatakan'):'SEMAKAN DIPERLUKAN | SK topik: '+q.sk),f:scheme.regular,s:9},...(q.curriculum?[{t:`DSKP (topik) hlm. ${q.curriculum.printedPages} | SP ${q.curriculum.codes}`,f:scheme.regular,s:9}]:[])];const height=lines.reduce((h,l)=>h+wrap(l.t,l.f,l.s,WIDTH).length*l.s*1.38+5,0)+16;
  if(y-height<60){page=scheme.doc.addPage(PAGE);y=top(scheme,page,true);}
  for(const l of lines)y=para(page,l.t,M,y,l.f,l.s)-5;y-=10;rule(page,y+5);y-=6;
 }
 if(meta.evidenceAppendix){
  const sources=new Map();items.forEach((q,i)=>(q.evidence?.snippets||[]).forEach(name=>{if(!sources.has(name))sources.set(name,{q,numbers:[]});sources.get(name).numbers.push(i+1);}));
  for(const [name,{q,numbers}] of sources){
   const e=q.evidence;page=scheme.doc.addPage(PAGE);y=top(scheme,page,true);
   y=para(page,'LAMPIRAN BUKTI BUKU TEKS',M,y,scheme.bold,13)-8;
   y=para(page,`Tingkatan ${q.form} | Edisi ${e.edition} | ISBN ${e.isbn}`,M,y,scheme.regular,9)-4;
   y=para(page,`Hlm. bercetak ${e.printedPages} | PDF halaman ${e.pdfPage} | Soalan ${numbers.join(', ')}`,M,y,scheme.regular,9)-10;
   const img=await scheme.doc.embedJpg(await loadEvidence(name));const scale=Math.min(WIDTH/img.width,(y-85)/img.height);
   const w=img.width*scale,h=img.height*scale;page.drawImage(img,{x:(PAGE[0]-w)/2,y:y-h,width:w,height:h});
   text(page,'Petikan untuk semakan prinsip jawapan; situasi soalan ialah binaan asal.',M,65,scheme.regular,8);
  }
 }
 finish(scheme,'SKEMA GURU');return {paper:await paper.doc.save(),scheme:await scheme.doc.save(),code,paperPages:paper.doc.getPageCount(),schemePages:scheme.doc.getPageCount(),questionBounds};
}
