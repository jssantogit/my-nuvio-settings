import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {refreshCollections} from '../scripts/refresh-collections.mjs';

const fixture = JSON.parse(readFileSync(new URL('../collections.json',import.meta.url),'utf8'));
const copy=()=>JSON.parse(JSON.stringify(fixture));
const folder=(data,hub,id)=>data.find(h=>h.id===hub).folders.find(f=>f.id===id);

test('Season dates track the current quarter',()=>{
 const d=refreshCollections(copy(),'2027-01-05');
 const s=folder(d,'hub-anime','anime-current-season');
 assert.equal(s.sources.find(x=>x.provider==='tmdb').filters.releaseDateGte,'2027-01-01');
 assert.equal(s.sources.find(x=>x.provider==='tmdb').filters.releaseDateLte,'2027-03-31');
 assert.equal(s.sources.filter(x=>x.provider==='tmdb')[2].title,'Filmes de 2027');
});
test('Upcoming releases begin after today',()=>{
 const d=refreshCollections(copy(),'2027-01-05');
 for(const s of folder(d,'hub-anime','anime-upcoming').sources.filter(x=>x.provider==='tmdb'))
  assert.equal(s.filters.releaseDateGte,'2027-01-06');
});
test('New doramas include five countries, plus broadcaster tvN',()=>{
 const d=refreshCollections(copy(),'2027-01-05');
 const f=folder(d,'hub-asia','asia-new-dramas');
 assert.equal(f.sources.length,6);
 for(const s of f.sources){
  assert.equal(s.filters.voteCountGte,null);
  assert.equal(s.filters.withGenres,null);
  assert.equal(s.filters.releaseDateLte,'2027-01-05');
 }
 assert.equal(f.sources.find(s=>s.title==='tvN · Coreia').filters.withNetworks,'866');
});
test('All preexisting sources remain; IDs stay unique',()=>{
 const d=refreshCollections(copy(),'2027-01-05');
 const ids=d.flatMap(h=>h.folders.map(f=>f.id));
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(d.length,13);
 assert.ok(d.reduce((a,h)=>a+h.folders.reduce((b,f)=>b+f.sources.length,0),0)>=736);
});
test('Updater is idempotent and never restores old cover URLs',()=>{
 const a=refreshCollections(copy(),'2027-01-05');
 const b=refreshCollections(a,'2027-01-05');
 assert.deepEqual(a,b);
 assert.ok(!JSON.stringify(a).includes('jssantogit/nuvio-covers/'));
});

test('Refresh preserves clean fallback without unsupported addon sources',()=>{
 const data=refreshCollections(copy(),'2027-04-05');
 const seasonal=folder(data,'hub-anime','anime-current-season');
 assert.equal(seasonal.sources.filter(s=>s.provider==='addon').length,0);
 assert.equal(seasonal.sources[0].filters.releaseDateGte,'2027-04-01');
 const upcoming=folder(data,'hub-anime','anime-upcoming');
 assert.equal(upcoming.sources.filter(s=>s.provider==='addon').length,0);
 assert(upcoming.sources.every(s=>s.filters.releaseDateGte==='2027-04-06'));
});
