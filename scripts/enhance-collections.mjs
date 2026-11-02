// Keep Nuvio collection imports compatible with manifests actually installed.
// Never publish a catalog reference merely because an upstream project supports it.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function enhanceCollections(data,options={}) {
 const aioId='aio-metadata';
 const animeId='community.nuvio.animekids';
 const aio=options.manifest;
 const anime=options.animeManifest;
 const findHub=(id)=>{const h=data.find(x=>x.id===id);if(!h)throw Error('Hub ausente: '+id);return h;};
 const folder=(hub,id)=>{const f=findHub(hub).folders.find(x=>x.id===id);if(!f)throw Error('Pasta ausente: '+id);return f;};
 const available=(manifest,expectedId,type,catalogId)=>{
  if(!manifest)return false;
  if(manifest.id!==expectedId)throw Error('Manifest de addon errado: '+manifest.id+' (esperado '+expectedId+')');
  if(!Array.isArray(manifest.catalogs))throw Error('Manifest sem catalogos validos');
  return manifest.catalogs.some(c=>c.id===catalogId&&c.type===type);
 };
 const injected = {
  [aioId]:new Set(['tmdb.airing_today','tvmaze.schedule','anilist.trending']),
  [animeId]:new Set(['recently-aired','latest-episodes','airing-today','seasonal'])
 };
 // Remove previous optional sources first. Re-add only when the *configured* manifest proves they exist.
 for(const h of data)for(const f of h.folders){
  f.sources=f.sources.filter(s=>!(s.provider==='addon'&&injected[s.addonId]?.has(s.catalogId)));
 }
 for(const [hub,id] of [['hub-series','series-episode-schedule'],['hub-anime','anime-episode-schedule']]){
  const h=findHub(hub);
  h.folders=h.folders.filter(f=>f.id!==id||f.sources.length>0);
 }
 const ensureFolder=(hub,id,title,fromId)=>{
  const h=findHub(hub);let f=h.folders.find(x=>x.id===id);
  if(!f){
   f=structuredClone(folder(hub,fromId));
   f.id=id;f.title=title;f.sources=[];f.catalogSources=[];
   h.folders.splice(h.folders.findIndex(x=>x.id===fromId),0,f);
  }
  return f;
 };
 const attach=(f,id,type,catalog,genre=null)=>{
  if(!f.sources.some(s=>s.provider==='addon'&&s.addonId===id&&s.type===type&&s.catalogId===catalog&&s.genre===genre))
   f.sources.push({provider:'addon',addonId:id,type,catalogId:catalog,genre});
 };
 if(available(aio,aioId,'series','tmdb.airing_today'))
  attach(ensureFolder('hub-series','series-episode-schedule','Episódios em exibição','series-airing'),aioId,'series','tmdb.airing_today');
 if(available(aio,aioId,'series','tvmaze.schedule'))
  attach(ensureFolder('hub-series','series-episode-schedule','Episódios em exibição','series-airing'),aioId,'series','tvmaze.schedule');
 if(available(aio,aioId,'anime','anilist.trending'))
  attach(folder('hub-anime','anime-popular'),aioId,'anime','anilist.trending');
 for(const [catalog,title] of [['recently-aired','Recém-exibidos'],['latest-episodes','Últimos episódios'],['airing-today','Hoje']]){
  if(available(anime,animeId,'series',catalog)){
   const f=ensureFolder('hub-anime','anime-episode-schedule','Episódios de anime','anime-new-releases');
   attach(f,animeId,'series',catalog);
  }
 }
 if(available(anime,animeId,'series','seasonal')){
  attach(folder('hub-anime','anime-current-season'),animeId,'series','seasonal','This season');
  attach(folder('hub-anime','anime-upcoming'),animeId,'series','seasonal','Next season');
 }
 const names={
  'anime-shounen':'Shounen',
  'anime-seinen':'Seinen',
  'anime-shoujo-josei':'Shoujo e josei',
  'anime-isekai-fantasy':'Isekai e fantasia'
 };
 for(const [id,title] of Object.entries(names))folder('hub-anime',id).title=title;
 for(const [id,catalogId] of Object.entries(options.catalogMap||{})){
  if(typeof catalogId!=='string'||!catalogId.trim())continue;
  if(!(id in names))throw Error('Pasta desconhecida: '+id);
  if(!/^anilist\.discover\.[a-zA-Z0-9._~-]+$/.test(catalogId))throw Error('catalogId AniList inválido: '+catalogId);
  if(!available(aio,aioId,'anime',catalogId))throw Error('Catálogo ausente no manifest AIO: '+catalogId);
  folder('hub-anime',id).sources=[{provider:'addon',addonId:aioId,type:'anime',catalogId,genre:null}];
 }
 const ids=data.flatMap(h=>h.folders.map(f=>f.id));
 if(new Set(ids).size!==ids.length)throw Error('Ids de pasta duplicados');
 return data;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const path=process.argv[2]||'collections.json';
 const manifestPath=process.argv[3];
 const mapPath=process.argv[4];
 const animeManifestPath=process.argv[5];
 if(mapPath&&!manifestPath)throw Error('Catálogos AniList precisam do manifest AIO');
 const options={
  manifest:manifestPath?JSON.parse(readFileSync(manifestPath,'utf8')):undefined,
  catalogMap:mapPath?JSON.parse(readFileSync(mapPath,'utf8')):undefined,
  animeManifest:animeManifestPath?JSON.parse(readFileSync(animeManifestPath,'utf8')):undefined
 };
 const result=enhanceCollections(JSON.parse(readFileSync(path,'utf8')),options);
 writeFileSync(path,JSON.stringify(result,null,1)+'\n');
 console.log('Updated',result.length,'hubs,',result.reduce((n,h)=>n+h.folders.length,0),'folders');
}
