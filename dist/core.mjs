export const DIAGRAMS={passing:'A',badminton:'B',segak:'C',triple:'D',elevation:'E',plates:'F',jrun:'G',communication:'H',landing:'I',nadi:'J',food:'K',totaps:'L',hurdles:'M',menus:'N',formation:'O',volley:'P',progress:'Q',offers:'R',hockey:'S',body:'T',cyber:'U'};
export const BLOOM={1:'Mengingat',2:'Memahami',3:'Mengaplikasi',4:'Menganalisis',5:'Menilai'};
export function flattenBank(data){return data.topics.flatMap(t=>t.questions.map(q=>({...q,form:t.form,section:t.section,topicId:t.id,topic:t.title,pages:t.pages,sk:t.sk,curriculum:q.reviewStatus==='evidence-checked'?t.curriculum:null,diagram:q.diagram||(t.diagram&&q.stem.includes('Rajah ')?DIAGRAMS[t.diagram]:null),bookUrl:data.books[t.form][2],dskpUrl:data.dskp[t.form]})));}
export function filterQuestions(bank,{form='',difficulties=[],topic='',bloom=''}={}){return bank.filter(q=>(!form||q.form===Number(form))&&(!difficulties.length||difficulties.includes(q.difficulty))&&(!topic||q.topicId===topic)&&(!bloom||(bloom==='hots'?q.bloom>=4:q.bloom===Number(bloom))));}
export function selectionStats(items){return {total:items.length,low:items.filter(q=>q.difficulty==='Rendah').length,medium:items.filter(q=>q.difficulty==='Sederhana').length,high:items.filter(q=>q.difficulty==='Tinggi').length,hots:items.filter(q=>q.bloom>=4).length,forms:[...new Set(items.map(q=>q.form))].sort()};}
export function validateSelection(ids,bank,target){if(!Number.isInteger(target)||target<1||target>bank.length)throw Error('Sasaran mestilah antara 1 dan '+bank.length+'.');if(!Array.isArray(ids)||ids.some(id=>!bank.some(q=>q.id===id)))throw Error('ID soalan tidak sah.');if(new Set(ids).size!==ids.length)throw Error('Soalan berulang tidak dibenarkan.');if(ids.length>target)throw Error('Pilihan melebihi sasaran.');return true;}
export function orderedItems(ids,bank){const byId=new Map(bank.map(q=>[q.id,q]));return ids.map(id=>byId.get(id)).filter(Boolean);}
export function moveItem(ids,id,delta){const at=ids.indexOf(id),to=at+delta;if(at<0||to<0||to>=ids.length)return [...ids];const copy=[...ids];[copy[at],copy[to]]=[copy[to],copy[at]];return copy;}

export const LEVELS=['Rendah','Sederhana','Tinggi'];
export function difficultyQuotas(total,percentages){
 if(!Number.isInteger(total)||total<1)throw Error('Bilangan soalan mestilah nombor bulat positif.');
 if(percentages.length!==3||percentages.some(p=>!Number.isFinite(p)||p<0||p>100)||Math.abs(percentages.reduce((a,b)=>a+b,0)-100)>0.00001)throw Error('Jumlah peratus mestilah 100%.');
 const raw=percentages.map(p=>p*total/100),counts=raw.map(Math.floor);let rest=total-counts.reduce((a,b)=>a+b,0);
 const order=[0,1,2].sort((a,b)=>(raw[b]-counts[b])-(raw[a]-counts[a])||a-b);for(let i=0;i<rest;i++)counts[order[i%3]]++;return counts;
}
export function autoSelect(pool,total,percentages,keep=[],random=Math.random){
 const quotas=difficultyQuotas(total,percentages),byId=new Map(pool.map(q=>[q.id,q]));
 if(new Set(keep).size!==keep.length)throw Error('Pilihan terkunci berulang.');
 if(keep.some(id=>!byId.has(id)))throw Error('Soalan yang dikekalkan tidak sepadan dengan penapis. Ubah penapis atau matikan pilihan kekalkan.');
 const selected=keep.map(id=>byId.get(id)),counts=LEVELS.map(l=>selected.filter(q=>q.difficulty===l).length);
 const errors=[];for(let i=0;i<3;i++){const available=pool.filter(q=>q.difficulty===LEVELS[i]).length;if(counts[i]>quotas[i])errors.push(`${LEVELS[i]}: ${counts[i]} dikekalkan melebihi kuota ${quotas[i]}`);if(available<quotas[i])errors.push(`${LEVELS[i]}: perlu ${quotas[i]}, tersedia ${available}`);}if(errors.length)throw Error(errors.join('. ')+'. Pilihan asal tidak diubah.');
 const used=new Set(keep),families=new Set(selected.map(q=>q.family||q.id));const topics=new Map();selected.forEach(q=>topics.set(q.topicId,(topics.get(q.topicId)||0)+1));
 for(let level=0;level<3;level++){
  const candidates=pool.filter(q=>q.difficulty===LEVELS[level]&&!used.has(q.id)).map(q=>({q,tie:random()}));
  while(counts[level]<quotas[level]){const valid=candidates.filter(x=>!used.has(x.q.id)&&!families.has(x.q.family||x.q.id));if(!valid.length)throw Error('Item unik tidak mencukupi selepas varian konsep berulang dikeluarkan. Pilihan asal tidak diubah.');valid.sort((a,b)=>(topics.get(a.q.topicId)||0)-(topics.get(b.q.topicId)||0)||a.tie-b.tie);const q=valid[0].q;selected.push(q);used.add(q.id);families.add(q.family||q.id);topics.set(q.topicId,(topics.get(q.topicId)||0)+1);counts[level]++;}
 }
 // Keep related topics together while retaining the order of manually protected items.
 return [...keep,...selected.filter(q=>!keep.includes(q.id)).sort((a,b)=>a.form-b.form||a.topicId.localeCompare(b.topicId)||a.id.localeCompare(b.id)).map(q=>q.id)];
}
