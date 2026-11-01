import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {enhanceCollections} from '../scripts/enhance-collections.mjs';
const file=()=>JSON.parse(readFileSync(new URL('../collections.json',import.meta.url),'utf8'));
const locate=(data,hub,id)=>data.find(x=>x.id===hub).folders.find(x=>x.id===id);
const sources=(data,hub,id)=>locate(data,hub,id).sources;
test('release tracking has a genuine episode schedule separate from first premieres',()=>{
 const data=file();
 const episodes=sources(data,'hub-series','series-episode-schedule');
 assert(episodes.some(s=>s.provider==='addon'&&s.catalogId==='tmdb.airing_today'&&s.type==='series'));
 assert(episodes.some(s=>s.provider==='addon'&&s.catalogId==='tvmaze.schedule'&&s.type==='series'));
 assert(!episodes.some(s=>s.provider==='tmdb'&&s.sortBy==='first_air_date.desc'));
});
test('anime episode calendars use only existing documented catalog identifiers',()=>{
 const data=file();
 const ep=sources(data,'hub-anime','anime-episode-schedule');
 assert.deepEqual(ep.filter(s=>s.provider==='addon').map(s=>s.catalogId),['recently-aired','latest-episodes','airing-today']);
 assert(ep.every(s=>s.addonId==='community.nuvio.animekids'&&s.type==='series'));
 assert(sources(data,'hub-anime','anime-current-season').some(s=>s.catalogId==='seasonal'));
});
test('inaccurate demographic buckets are labelled explicitly as related recommendations',()=>{
 const data=file();
 for(const id of ['anime-shounen','anime-seinen','anime-shoujo-josei','anime-isekai-fantasy']){
  assert.match(locate(data,'hub-anime',id).title,/aproximação/i);
 }
});
test('enhancement is idempotent and does not remove any original folders',()=>{
 const first=file();const before=first.map(h=>[h.id,h.folders.length]);
 const second=enhanceCollections(JSON.parse(JSON.stringify(first)));
 assert.deepEqual(second,first);
 const actual=second.map(h=>[h.id,h.folders.length]);
 assert.deepEqual(actual,before);
});
test('AniList catalog mapping rejects IDs absent from the real installed AIO manifest',()=>{
 const base=file();
 const manifest={id:'aio-metadata',catalogs:[{id:'anilist.discover.real_abc',type:'anime'}]};
 assert.throws(()=>enhanceCollections(JSON.parse(JSON.stringify(base)),{manifest,catalogMap:{'anime-shounen':'anilist.discover.unknown'}}),/não está no manifest|ausente/i);
 const d=enhanceCollections(JSON.parse(JSON.stringify(base)),{manifest,catalogMap:{'anime-shounen':'anilist.discover.real_abc'}});
 const f=locate(d,'hub-anime','anime-shounen');
 assert.equal(f.title,'Shounen');
 assert(f.sources.some(s=>s.catalogId==='anilist.discover.real_abc'&&s.type==='anime'));
 assert.equal(f.sources.filter(s=>s.catalogId==='anilist.discover.real_abc').length,1);
});
