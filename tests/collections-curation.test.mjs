import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {refreshCollections} from '../scripts/refresh-collections.mjs';

const snapshot=()=>JSON.parse(readFileSync(new URL('../collections.json', import.meta.url), 'utf8'));
const hub=(d,id)=>d.find(x=>x.id===id);
const folder=(d,h,id)=>hub(d,h)?.folders.find(x=>x.id===id);
const allSources=(d)=>d.flatMap(h=>h.folders.flatMap(f=>f.sources));
const votes=(s)=>s.filters?.voteCountGte;

test('new and current-season anime are one folder with both sources retained',()=>{
 const d=snapshot();
 assert.equal(folder(d,'hub-anime','anime-new-releases'),undefined);
 const f=folder(d,'hub-anime','anime-current-season');
 assert.equal(f.title,'Animes da temporada');
 for(const name of ['Em alta da temporada','Melhores da temporada','Estreias da temporada','Estreias recentes','Filmes recentes'])
   assert(f.sources.some(x=>x.title===name),name);
 assert.equal(new Set(f.sources.map(x=>x.title)).size,f.sources.length);
});

test('other Asian premieres are non-Korean, without duplicated K-drama artwork/logo',()=>{
 const d=snapshot();
 const others=folder(d,'hub-asia','asia-new-dramas');
 const korean=folder(d,'hub-asia','asia-kdramas');
 assert.equal(others.title,'Outros');
 assert.equal(others.coverImageUrl,null);
 assert.equal(others.titleLogoUrl,null);
 assert.deepEqual(others.sources.map(x=>x.filters.withOriginCountry),['JP','CN','TW','TH']);
 assert(others.sources.every(x=>x.filters.withOriginCountry!=='KR'));
 assert(korean.sources.some(x=>x.title==='Recentes'&&x.filters.withOriginCountry==='KR'));
 assert(korean.sources.some(x=>x.filters.withNetworks==='866'&&x.filters.withOriginCountry==='KR'));
 assert(korean.sources.every(x=>!['JP','CN','TW','TH'].includes(x.filters?.withOriginCountry)));
});

test('light vote floors apply to recent releases, but not to unrelated future releases',()=>{
 const d=snapshot();
 const recent=folder(d,'hub-discover','discover-new-releases').sources;
 for(const s of recent){
  assert.equal(votes(s), s.title==='Filmes'?10:s.title==='Documentários'?5:s.title==='Anime'?3:5);
 }
 assert.equal(votes(folder(d,'hub-series','series-airing').sources[0]),5);
 for(const s of folder(d,'hub-anime','anime-current-season').sources)
   assert(votes(s)>=3, 'anime '+s.title);
 assert(folder(d,'hub-asia','asia-new-dramas').sources.every(s=>votes(s)===3));
 assert.equal(votes(folder(d,'hub-asia','asia-kdramas').sources[0]),3);
 assert(folder(d,'hub-discover','discover-anticipated').sources.some(s=>votes(s)===null));
});

test('refresh keeps merged layout, borders and vote floors on later seasons and remains idempotent',()=>{
 const a=refreshCollections(snapshot(),'2027-01-15');
 const b=refreshCollections(structuredClone(a),'2027-01-15');
 assert.deepEqual(a,b);
 assert.equal(folder(a,'hub-anime','anime-new-releases'),undefined);
 const season=folder(a,'hub-anime','anime-current-season');
 assert.equal(season.sources.find(x=>x.title==='Em alta da temporada').filters.releaseDateGte,'2027-01-01');
 assert.equal(season.sources.find(x=>x.title==='Estreias da temporada').filters.releaseDateLte,'2027-01-15');
 assert.equal(season.sources.find(x=>x.title==='Estreias recentes').filters.releaseDateLte,'2027-01-15');
 assert.equal(season.sources.find(x=>x.title==='Filmes de 2027').filters.voteCountGte,5);
 assert.equal(folder(a,'hub-asia','asia-new-dramas').title,'Outros');
 assert.equal(folder(a,'hub-asia','asia-new-dramas').coverImageUrl,null);
 assert.equal(folder(a,'hub-asia','asia-kdramas').sources.filter(x=>x.filters?.withNetworks==='866').length,1);
 assert.equal(folder(a,'hub-discover','discover-new-releases').sources[0].filters.releaseDateLte,'2027-01-15');
 assert.equal(new Set(a.flatMap(h=>h.folders.map(f=>f.id))).size,a.reduce((n,h)=>n+h.folders.length,0));
 assert.equal(allSources(a).filter(s=>s.provider==='addon').length,0);
});

test('refresh migrates older anime/Asia folders once without duplicating Korean sources',()=>{
 const d=snapshot();
 const anime=hub(d,'hub-anime'); const season=folder(d,'hub-anime','anime-current-season');
 const recent=season.sources.filter(s=>['Estreias recentes','Filmes recentes'].includes(s.title)).map(s=>structuredClone(s));
 season.sources=season.sources.filter(s=>!recent.some(x=>x.title===s.title));
 anime.folders.unshift({...structuredClone(season),id:'anime-new-releases',title:'Novos animes',sources:recent.map(s=>({...s,title:s.title==='Estreias recentes'?'Estreias de séries':'Filmes recém-lançados'}))});
 const asia=hub(d,'hub-asia');
 const other=folder(d,'hub-asia','asia-new-dramas');
 const korean=folder(d,'hub-asia','asia-kdramas');
 const tvn=korean.sources.find(s=>s.filters?.withNetworks==='866');
 korean.sources=korean.sources.filter(s=>s!==tvn);
 other.title='Novos doramas';
 other.coverImageUrl=korean.coverImageUrl;other.titleLogoUrl=korean.titleLogoUrl;
 other.sources.unshift({...structuredClone(korean.sources[0]),title:'Coreia do Sul'});
 other.sources.push({...structuredClone(tvn),title:'tvN · Coreia'});
 const migrated=refreshCollections(d,'2027-01-15');
 const again=refreshCollections(structuredClone(migrated),'2027-01-15');
 assert.deepEqual(migrated,again);
 assert.equal(folder(migrated,'hub-anime','anime-new-releases'),undefined);
 assert.equal(folder(migrated,'hub-anime','anime-current-season').sources.length,6);
 assert.equal(folder(migrated,'hub-asia','asia-new-dramas').sources.length,4);
 assert.equal(folder(migrated,'hub-asia','asia-kdramas').sources.filter(s=>s.filters?.withNetworks==='866').length,1);
});
