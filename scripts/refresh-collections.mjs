// Keep Nuvio release windows current; do not automatically reimport into a Nuvio account.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function refreshCollections(data,today){
 const copy=x=>JSON.parse(JSON.stringify(x));
 const prior="https://raw.githubusercontent.com/jssantogit/nuvio-covers/main/";
 const current="https://raw.githubusercontent.com/jssantogit/my-nuvio-settings/main/";
 const daysAgo=(n)=>new Date(Date.parse(today+"T12:00:00Z")-n*86400000).toISOString().slice(0,10);
 const daysAhead=(n)=>new Date(Date.parse(today+"T12:00:00Z")+n*86400000).toISOString().slice(0,10);
 const swapCovers=v=>{
  if(typeof v==="string")return v.startsWith(prior)?current+v.slice(prior.length):v;
  if(Array.isArray(v))return v.map(swapCovers);
  if(v&&typeof v==="object")for(const key of Object.keys(v))v[key]=swapCovers(v[key]);
  return v;
 };
 swapCovers(data);
 const getHub=id=>{const h=data.find(h=>h.id===id);if(!h)throw Error("Hub não encontrado: "+id);return h;};
 const getFolder=(hub,id)=>{const f=getHub(hub).folders.find(f=>f.id===id);if(!f)throw Error("Pasta não encontrada: "+id);return f;};
 const tmdb=(source,from,to,voteFloor)=>{
  if(source.provider!=="tmdb"||!source.filters)throw Error("Fonte TMDB inválida: "+source.title);
  source.filters.releaseDateGte=from;
  source.filters.releaseDateLte=to;
  source.filters.voteCountGte=voteFloor;
  return source;
 };
 // Votos da TMDB: pequeno piso de reconhecimento, sem nota mínima.
 const discover=getFolder("hub-discover","discover-new-releases");
 for(const s of discover.sources.filter(s=>s.provider==="tmdb")){
  const floor=s.title==="Filmes"?10:s.title==="Anime"?3:5;
  tmdb(s,daysAgo(s.mediaType==="TV"?120:180),today,floor);
 }
 for(const s of getFolder("hub-discover","discover-anticipated").sources.filter(s=>s.provider==="tmdb"))
  tmdb(s,daysAhead(1),daysAhead(365),null);
 getFolder("hub-discover","discover-weekly-top").title="Destaques e rankings";
 getFolder("hub-discover","discover-streaming-new").title="Destaques do streaming";

 const series=getFolder("hub-series","series-airing");
 series.title="Séries novas e populares";
 tmdb(series.sources[0],daysAgo(120),today,5);

 // Unifica "Novos animes" com "Temporada atual", preservando as duas perspectivas de estreia.
 const anime=getHub("hub-anime");
 const season=getFolder("hub-anime","anime-current-season");
 const obsolete=anime.folders.find(f=>f.id==="anime-new-releases");
 if(obsolete){
  for(const source of obsolete.sources){
   const s=copy(source);
   if(s.title==="Estreias de séries")s.title="Estreias recentes";
   if(s.title==="Filmes recém-lançados")s.title="Filmes recentes";
   if(!season.sources.some(x=>x.title===s.title&&x.provider===s.provider&&x.mediaType===s.mediaType))
    season.sources.push(s);
  }
  anime.folders=anime.folders.filter(f=>f.id!=="anime-new-releases");
 }
 season.title="Animes da temporada";
 const seasonPick=title=>season.sources.find(s=>s.title===title&&s.provider==="tmdb");
 const year=Number(today.slice(0,4));
 const month=Number(today.slice(5,7));
 const quarterStart=year+"-"+String(Math.floor((month-1)/3)*3+1).padStart(2,"0")+"-01";
 const highlighted=seasonPick("Em alta da temporada");
 const rated=seasonPick("Melhores da temporada");
 const thisYear=season.sources.find(s=>s.provider==="tmdb"&&/^Filmes de \d{4}$/.test(s.title));
 if(!highlighted||!rated||!thisYear)throw Error("Fontes da temporada de animes não encontradas");
 let premieres=seasonPick("Estreias da temporada");
 if(!premieres){
  premieres=copy(highlighted);
  premieres.title="Estreias da temporada";
  premieres.sortBy="first_air_date.desc";
  season.sources.push(premieres);
 }
 tmdb(highlighted,quarterStart,today,3);
 tmdb(rated,quarterStart,today,5);
 tmdb(premieres,quarterStart,today,3);
 thisYear.title="Filmes de "+year;
 tmdb(thisYear,year+"-01-01",today,5);
 let animeRecent=seasonPick("Estreias recentes");
 if(!animeRecent){
  animeRecent=copy(premieres);
  animeRecent.title="Estreias recentes";
  season.sources.push(animeRecent);
 }
 animeRecent.sortBy="first_air_date.desc";
 tmdb(animeRecent,daysAgo(120),today,3);
 let moviesRecent=seasonPick("Filmes recentes");
 if(!moviesRecent){
  moviesRecent=copy(thisYear);
  moviesRecent.title="Filmes recentes";
  moviesRecent.mediaType="MOVIE";
  moviesRecent.sortBy="primary_release_date.desc";
  season.sources.push(moviesRecent);
 }
 tmdb(moviesRecent,daysAgo(180),today,5);
 const order=["Em alta da temporada","Estreias da temporada","Estreias recentes","Melhores da temporada","Filmes recentes","Filmes de "+year];
 season.sources.sort((a,b)=>{
  const i=order.indexOf(a.title),j=order.indexOf(b.title);
  return (i<0?999:i)-(j<0?999:j);
 });
 for(const s of getFolder("hub-anime","anime-upcoming").sources.filter(s=>s.provider==="tmdb"))
  tmdb(s,daysAhead(1),daysAhead(365),null);

 // Coreia é K-drama; demais produções asiáticas permanecem em "Outros".
 const asia=getHub("hub-asia");
 const korea=getFolder("hub-asia","asia-kdramas");
 for(const id of ["asia-kdramas","asia-jdramas","asia-cdramas"]){
  const src=getFolder("hub-asia",id).sources[0];
  src.filters.withGenres=null;
  src.filters.withoutGenres="16";
  tmdb(src,daysAgo(120),today,3);
 }
 const others=getFolder("hub-asia","asia-new-dramas");
 const tvnFromOther=others.sources.find(s=>s.provider==="tmdb"&&s.filters?.withOriginCountry==="KR"&&s.filters?.withNetworks==="866");
 let tvn=korea.sources.find(s=>s.provider==="tmdb"&&s.filters?.withOriginCountry==="KR"&&s.filters?.withNetworks==="866");
 if(!tvn){
  tvn=copy(tvnFromOther??korea.sources[0]);
  tvn.filters.withNetworks="866";
  tvn.filters.withOriginCountry="KR";
  tvn.filters.withOriginalLanguage="ko";
  korea.sources.push(tvn);
 }
 tvn.title="tvN · recentes";
 tvn.filters.withGenres=null;
 tvn.filters.withoutGenres="16";
 tmdb(tvn,daysAgo(120),today,3);
 others.id="asia-new-dramas";
 others.title="Outros";
 others.coverImageUrl=null;
 others.titleLogoUrl=null;
 const countries=["JP","CN","TW","TH"];
 others.sources=others.sources.filter(s=>s.provider==="tmdb"&&countries.includes(s.filters?.withOriginCountry));
 others.sources.sort((a,b)=>countries.indexOf(a.filters.withOriginCountry)-countries.indexOf(b.filters.withOriginCountry));
 for(const s of others.sources){
  s.filters.withGenres=null;
  s.filters.withoutGenres="16";
  tmdb(s,daysAgo(120),today,3);
 }
 const ids=data.flatMap(h=>h.folders.map(f=>f.id));
 if(new Set(ids).size!==ids.length)throw Error("IDs de pastas duplicados");
 return data;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const path=process.argv[2]||'collections.json';
 const today=process.argv[3]||new Date().toISOString().slice(0,10);
 const updated=refreshCollections(JSON.parse(readFileSync(path,'utf8')),today);
 const ids=updated.flatMap(h=>h.folders.map(f=>f.id));
 if(new Set(ids).size!==ids.length)throw Error('Duplicate folder IDs');
 writeFileSync(path,JSON.stringify(updated,null,1)+'\n');
 console.log('Refreshed',today,'hubs:',updated.length,'folders:',ids.length);
}
