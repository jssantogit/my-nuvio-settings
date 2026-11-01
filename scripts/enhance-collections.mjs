// Adds validated episode catalogs and optional custom AniList taxonomy sources.
// External addon catalogs require users to install and enable the referenced addon.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function enhanceCollections(data,options={}){
 const folder=(hub,id)=>{const h=data.find(h=>h.id===hub);if(!h)throw Error(`Hub ausente: ${hub}`);const f=h.folders.find(f=>f.id===id);if(!f)throw Error(`Pasta ausente: ${id}`);return f;};
 const ensure=(hub,id,title,fromId)=>{const h=data.find(h=>h.id===hub);let f=h.folders.find(f=>f.id===id);if(!f){f=JSON.parse(JSON.stringify(folder(hub,fromId)));f.id=id;f.title=title;f.sources=[];f.catalogSources=[];h.folders.splice(h.folders.findIndex(x=>x.id===fromId),0,f);}return f;};
 const add=(f,addonId,type,catalogId,genre=null)=>{if(!f.sources.some(s=>s.provider==='addon'&&s.addonId===addonId&&s.type===type&&s.catalogId===catalogId&&s.genre===genre))f.sources.unshift({provider:'addon',addonId,type,catalogId,genre});};
 const aio='aio-metadata',nuvioAnime='community.nuvio.animekids';
 const tv=ensure('hub-series','series-episode-schedule','Episódios em exibição','series-airing');
 add(tv,aio,'series','tvmaze.schedule');
 add(tv,aio,'series','tmdb.airing_today');
 const an=ensure('hub-anime','anime-episode-schedule','Anime · episódios em exibição','anime-new-releases');
 // Append, not unshift: order matters (recently aired > latest episodes > today).
 for(const id of ['recently-aired','latest-episodes','airing-today'])if(!an.sources.some(s=>s.provider==='addon'&&s.catalogId===id&&s.addonId===nuvioAnime))an.sources.push({provider:'addon',addonId:nuvioAnime,type:'series',catalogId:id,genre:null});
 add(folder('hub-anime','anime-current-season'),nuvioAnime,'series','seasonal','This season');
 add(folder('hub-anime','anime-upcoming'),nuvioAnime,'series','seasonal','Next season');
 add(folder('hub-anime','anime-popular'),aio,'anime','anilist.trending');
 const affected={
  'anime-shounen':'Shounen',
  'anime-seinen':'Seinen',
  'anime-shoujo-josei':'Shoujo e josei',
  'anime-isekai-fantasy':'Isekai e fantasia'
 };
 for(const [id,label] of Object.entries(affected)) {
  const f=folder('hub-anime',id);
  if(!options.catalogMap?.[id]) f.title=label+' — aproximação temática';
 }
 const catalogMap=options.catalogMap||{};
 const entries=Object.entries(catalogMap).filter(([,id])=>typeof id==='string'&&id.trim());
 if(entries.length){
  if(!options.manifest||!Array.isArray(options.manifest.catalogs))throw Error('Manifest AIO real é obrigatório para validar catalogIds');
  if(options.manifest.id!==aio)throw Error('Manifest incorreto: addonId não é aio-metadata');
  for(const [folderId,catalogId] of entries){
   if(!(folderId in affected))throw Error('Pasta de taxonomia inválida: '+folderId);
   if(!/^anilist\.discover\.[a-zA-Z0-9._~-]+$/.test(catalogId))throw Error('ID AniList Discover inválido: '+catalogId);
   if(!options.manifest.catalogs.some(x=>x.id===catalogId&&x.type==='anime'))throw Error(`Catálogo ausente no manifest AIO: ${catalogId}`);
   const f=folder('hub-anime',folderId);
   f.title=affected[folderId];
   f.sources=[{provider:'addon',addonId:aio,type:'anime',catalogId,genre:null}];
  }
 }
 const ids=data.flatMap(h=>h.folders.map(f=>f.id));
 if(new Set(ids).size!==ids.length)throw Error('IDs duplicados');
 return data;
}
if (process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]) {
 const path=process.argv[2]||'collections.json';
 const manifestPath=process.argv[3];
 const mapPath=process.argv[4];
 if(Boolean(manifestPath)!==Boolean(mapPath))throw Error('Forneça juntos manifest.json e catalog-map.json');
 const manifest=manifestPath?JSON.parse(readFileSync(manifestPath,'utf8')):undefined;
 const catalogMap=mapPath?JSON.parse(readFileSync(mapPath,'utf8')):undefined;
 const original=JSON.parse(readFileSync(path,'utf8'));
 const updated=enhanceCollections(original,{manifest,catalogMap});
 writeFileSync(path,JSON.stringify(updated,null,1)+'\n');
 console.log('Updated catalogs:',updated.reduce((n,h)=>n+h.folders.length,0),'folders');
}
