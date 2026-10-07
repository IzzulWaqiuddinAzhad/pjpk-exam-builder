import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {flattenBank,filterQuestions,selectionStats,validateSelection,orderedItems,moveItem,difficultyQuotas,autoSelect} from '../dist/core.mjs';
const data=JSON.parse(await readFile(new URL('../dist/assets/bank.json',import.meta.url)));const bank=flattenBank(data);
test('T2–5 bank has unique items and matching answer keys',()=>{assert.equal(data.topics.length,78);assert.equal(bank.length,630);assert.equal(new Set(bank.map(q=>q.id)).size,630);for(const q of bank){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options['ABCD'.indexOf(q.answer)],q.correct);}});
test('form, difficulty, topic, and HOTS filters intersect correctly',()=>{const result=filterQuestions(bank,{form:3,difficulties:['Sederhana','Tinggi'],bloom:'hots'});assert.ok(result.length);assert.ok(result.every(q=>q.form===3&&q.bloom>=4&&['Sederhana','Tinggi'].includes(q.difficulty)));const topic=filterQuestions(bank,{topic:data.topics[0].id});assert.equal(topic.length,10);assert.equal(filterQuestions(bank,{form:5,topic:data.topics[0].id}).length,0);});
test('50-item selection preserves order and rejects invalid or duplicate entries',()=>{const ids=bank.filter(q=>q.form===3).slice(0,50).map(q=>q.id);assert.ok(validateSelection(ids,bank,50));assert.throws(()=>validateSelection(ids,bank,49));assert.throws(()=>validateSelection([ids[0],ids[0]],bank,50));assert.throws(()=>validateSelection(['invented'],bank,50));assert.throws(()=>validateSelection(ids,bank,0));const moved=moveItem(ids,ids[2],-1);assert.equal(moved[1],ids[2]);assert.equal(ids[1],bank.filter(q=>q.form===3)[1].id);assert.deepEqual(orderedItems(moved,bank).map(q=>q.id),moved);});
test('summary totals match selection',()=>{const s=selectionStats(bank);assert.equal(s.total,s.low+s.medium+s.high);assert.equal(s.hots,bank.filter(q=>q.bloom>=4).length);assert.deepEqual(s.forms,[2,3,4,5]);});

const verified=bank.filter(q=>q.reviewStatus==='evidence-checked');
test('source evidence exists and is restricted to the current forms',async()=>{
 assert.equal(verified.length,240);for(const q of verified){assert.ok(q.evidence.printedPages&&q.evidence.pdfPage>0&&q.evidence.isbn);assert.ok(q.reason.length>20);assert.equal(q.curriculum.scope,'topic-context');assert.ok(q.curriculum.codes&&q.curriculum.printedPages&&q.curriculum.url);for(const file of q.evidence.snippets){const image=await readFile(new URL('../dist/assets/evidence/'+file,import.meta.url));assert.ok(image.length>1000);assert.equal(image[0],255);assert.equal(image[1],216);}}
 assert.ok(bank.every(q=>q.form>=2&&q.form<=5));
});
test('quotas round to exact totals and reject malformed distributions',()=>{
 assert.deepEqual(difficultyQuotas(50,[20,60,20]),[10,30,10]);assert.deepEqual(difficultyQuotas(7,[20,60,20]),[2,4,1]);assert.deepEqual(difficultyQuotas(3,[0,100,0]),[0,3,0]);
 for(const p of [[20,50,20],[NaN,80,20],[-1,81,20],[101,0,-1]])assert.throws(()=>difficultyQuotas(50,p));assert.throws(()=>difficultyQuotas(2.5,[20,60,20]));
});
test('every form supports a balanced 50-item paper with broad topic coverage',()=>{
 for(const form of [2,3,4,5]){const pool=verified.filter(q=>q.form===form),ids=autoSelect(pool,50,[20,60,20],[],()=>.5),items=orderedItems(ids,bank),s=selectionStats(items);assert.equal(ids.length,50);assert.equal(new Set(ids).size,50);assert.deepEqual([s.low,s.medium,s.high],[10,30,10]);assert.equal(new Set(items.map(q=>q.topicId)).size,12);assert.ok(items.every(q=>q.form===form));}
});
test('preservation respects filters and shortages never mutate the input',()=>{
 const pool=verified.filter(q=>q.form===2),keep=[pool[0].id];assert.equal(autoSelect(pool,50,[20,60,20],keep)[0],keep[0]);
 assert.throws(()=>autoSelect(pool,100,[20,60,20],keep),/tersedia/);assert.deepEqual(keep,[pool[0].id]);assert.throws(()=>autoSelect(pool,10,[0,100,0],keep),/melebihi kuota/);assert.throws(()=>autoSelect(pool,10,[20,60,20],[verified.find(q=>q.form===3).id]),/penapis/);
 assert.throws(()=>autoSelect(pool,10,[20,60,20],[keep[0],keep[0]]),/berulang/);
 const variants=pool.map(q=>({...q,family:'one-concept'}));assert.throws(()=>autoSelect(variants,10,[20,60,20]),/unik/);
});
