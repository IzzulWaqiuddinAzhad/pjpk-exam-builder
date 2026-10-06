import assert from 'node:assert/strict';import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {flattenBank} from '../dist/core.mjs';import {createExamPDFs,examCode} from '../dist/pdf.mjs';
globalThis.self=globalThis;await import('../dist/vendor/pdf-lib.min.js');const bank=flattenBank(JSON.parse(await readFile(new URL('../dist/assets/bank.json',import.meta.url))));
// A wide source diagram is used as a non-branded logo fixture to check aspect-ratio fitting.
const fixture=await readFile(new URL('../dist/assets/Rajah_B.png',import.meta.url));const logoDataUrl='data:image/png;base64,'+fixture.toString('base64');
const meta={school:'SEKOLAH MENENGAH KEBANGSAAN',title:'PEPERIKSAAN AKHIR TAHUN',year:'2026',duration:'1 jam 15 minit',teacher:'Izzul Waqiuddin Azhad',reviewedBy:'Nama Penyemak',approvedBy:'Nama Pengesah',cover:true,logoDataUrl,instructions:''};
const result=await createExamPDFs(bank.slice(0,5),meta);assert.equal(result.code,examCode(bank.slice(0,5),meta));assert.notEqual(result.code,examCode(bank.slice(0,5),{...meta,reviewedBy:'Penyemak lain'}));assert.notEqual(result.code,examCode(bank.slice(0,5),{...meta,logoDataUrl:null}));
await mkdir(new URL('../test-output/',import.meta.url),{recursive:true});await writeFile(new URL('../test-output/Branding_Cover.pdf',import.meta.url),result.paper);await writeFile(new URL('../test-output/Branding_Scheme.pdf',import.meta.url),result.scheme);
const long={...meta,school:'Sekolah Menengah Kebangsaan '.repeat(5).slice(0,110),title:'Peperiksaan Pentaksiran Akhir Tahun '.repeat(4).slice(0,100),teacher:'Nama Penuh Guru '.repeat(8).slice(0,100),reviewedBy:'Nama Penuh Penyemak '.repeat(7).slice(0,100),approvedBy:'Nama Penuh Pengesah '.repeat(7).slice(0,100),instructions:'Sila baca semua arahan dengan teliti sebelum menjawab soalan. '.repeat(9).slice(0,500)};
const edge=await createExamPDFs(bank.slice(0,5),long);await writeFile(new URL('../test-output/Branding_Long_Cover.pdf',import.meta.url),edge.paper);
await assert.rejects(()=>createExamPDFs(bank.slice(0,1),{...meta,logoDataUrl:'not-a-png'}),/Logo sekolah/);
console.log('PASS: logo embedding, reviewer/approver metadata, matching paper codes, long cover fields and invalid logo handling.');
