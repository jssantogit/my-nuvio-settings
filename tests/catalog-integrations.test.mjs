import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {enhanceCollections} from '../scripts/enhance-collections.mjs';

const base=()=>JSON.parse(readFileSync(new URL('../collections.json',import.meta.url),'utf8'));
const folder=(data,hub,id)=>data.find(h=>h.id===hub)?.folders.find(f=>f.id===id);
const getSources=(data)=>data.flatMap(h=>h.folders.flatMap(f=>f.sources));
const visibleAio={id:'aio-metadata',version:'3.8.3',catalogs:[
 {id:'streaming.pcp_movie',type:'filme'}, {id:'streaming.pcp_series',type:'serie'},
 {id:'streaming.sta_movie',type:'filme'}, {id:'streaming.sta_series',type:'serie'},
 {id:'search.movie',type:'movie'}, {id:'search.series',type:'series'},
 {id:'calendar-videos',type:'series'}, {id:'aiom.similar',type:'movie'}, {id:'aiom.similar',type:'series'}
]};

test('published collections do not contain missing catalog references from the user manifest',()=>{
 const data=base();
 assert(!folder(data,'hub-series','series-episode-schedule'),'unsupported empty folder must not be published');
 assert(!folder(data,'hub-anime','anime-episode-schedule'),'uninstalled addon folder must not be published');
 assert.equal(getSources(data).filter(s=>s.provider==='addon').length,0);
});
test('titles remain uncluttered for every demographic and thematic anime folder',()=>{
 const data=base();
 const expected={'anime-shounen':'Shounen','anime-seinen':'Seinen','anime-shoujo-josei':'Shoujo e josei','anime-isekai-fantasy':'Isekai e fantasia'};
 for(const [id,title] of Object.entries(expected))assert.equal(folder(data,'hub-anime',id)?.title,title);
 assert(!data.some(h=>h.folders.some(f=>/aproximação temática/i.test(f.title))));
});
test('the nine actual configured AIO catalogs enable no unavailable episodic sources',()=>{
 const data=enhanceCollections(base(),{manifest:visibleAio});
 assert.deepEqual(data,base());
 assert(!getSources(data).some(s=>['tmdb.airing_today','tvmaze.schedule','anilist.trending'].includes(s.catalogId)));
});
test('even a real catalog with mismatched type is not linked',()=>{
 const data=enhanceCollections(base(),{manifest:{id:'aio-metadata',catalogs:[{id:'tmdb.airing_today',type:'movie'}]}});
 assert(!folder(data,'hub-series','series-episode-schedule'));
});
test('validating a manifest with the right ID and catalog actually enables episode sources',()=>{
 const manifest={id:'aio-metadata',catalogs:[{id:'tmdb.airing_today',type:'series'},{id:'tvmaze.schedule',type:'series'},{id:'anilist.trending',type:'anime'}]};
 const data=enhanceCollections(base(),{manifest});
 const ep=folder(data,'hub-series','series-episode-schedule');
 assert.deepEqual(ep.sources.map(s=>s.catalogId),['tmdb.airing_today','tvmaze.schedule']);
 assert.equal(ep.sources[0].addonId,'aio-metadata');
 assert(getSources(data).some(s=>s.catalogId==='anilist.trending'));
});
test('anime episode catalogs only appear after validating the optional addon manifest',()=>{
 const animeManifest={id:'community.nuvio.animekids',catalogs:[
 {id:'recently-aired',type:'series'},{id:'latest-episodes',type:'series'},{id:'airing-today',type:'series'},{id:'seasonal',type:'series'}
 ]};
 const data=enhanceCollections(base(),{animeManifest});
 assert.deepEqual(folder(data,'hub-anime','anime-episode-schedule').sources.map(s=>s.catalogId),['recently-aired','latest-episodes','airing-today']);
 assert(folder(data,'hub-anime','anime-current-season').sources.some(s=>s.catalogId==='seasonal'));
});
test('enhancement is idempotent without manifests',()=>{
 const data=base();
 assert.deepEqual(enhanceCollections(enhanceCollections(data)),data);
});
test('AniList demographics reject fabricated IDs but accept exactly configured ones',()=>{
 const manifest={id:'aio-metadata',catalogs:[{id:'anilist.discover.real_abc',type:'anime'}]};
 assert.throws(()=>enhanceCollections(base(),{manifest,catalogMap:{'anime-shounen':'anilist.discover.not_real'}}),/ausente/i);
 const d=enhanceCollections(base(),{manifest,catalogMap:{'anime-shounen':'anilist.discover.real_abc'}});
 const f=folder(d,'hub-anime','anime-shounen');
 assert.equal(f.title,'Shounen');
 assert.equal(f.sources.length,1);
 assert.equal(f.sources[0].catalogId,'anilist.discover.real_abc');
});
