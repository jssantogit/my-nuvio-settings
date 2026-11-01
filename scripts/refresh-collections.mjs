// Build date-aware Nuvio import JSON from the existing collections.json.
// This does not automatically re-import into a user's Nuvio account.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function refreshCollections(data,today){
 const old="https://raw.githubusercontent.com/jssantogit/nuvio-covers/main/";
 const next="https://raw.githubusercontent.com/jssantogit/my-nuvio-settings/main/";
 const dateOffset=(iso,n)=>new Date(Date.parse(iso+"T12:00:00Z")+n*86400000).toISOString().slice(0,10);
 function urls(v){if(typeof v==="string")return v.startsWith(old)?next+v.slice(old.length):v;if(Array.isArray(v))return v.map(urls);if(v&&typeof v==="object"){for(const k in v)v[k]=urls(v[k]);}return v;}
 urls(data);
 const year=+today.slice(0,4),month=+today.slice(5,7),qmonth=Math.floor((month-1)/3)*3+1;
 const quarterStart=`${year}-${String(qmonth).padStart(2,"0")}-01`;
 const quarterEnd=new Date(Date.UTC(year,qmonth+2,0)).toISOString().slice(0,10);
 const coming=dateOffset(today,1),upTo=dateOffset(today,365);
 const find=(hub,folder)=>data.find(h=>h.id===hub).folders.find(f=>f.id===folder);
 const win=(s,start,end,votes=null)=>{s.filters.releaseDateGte=start;s.filters.releaseDateLte=end;s.filters.voteCountGte=votes;return s;};
 const cp=(o,title)=>{const s=JSON.parse(JSON.stringify(o));s.title=title;return s;};
 for(const s of find("hub-discover","discover-new-releases").sources)win(s,dateOffset(today,s.mediaType==="TV"?-120:-180),today);
 for(const s of find("hub-discover","discover-anticipated").sources)win(s,coming,upTo);
 find("hub-discover","discover-weekly-top").title="Destaques e rankings";
 find("hub-discover","discover-streaming-new").title="Destaques do streaming";
 const seas=find("hub-anime","anime-current-season");seas.title="Temporada de anime atual";
 const seasonTmdb=seas.sources.filter(s=>s.provider==='tmdb');
 for(let i=0;i<2;i++)win(seasonTmdb[i],quarterStart,quarterEnd,i===0?null:3);
 const movie=seasonTmdb[2];movie.title=`Filmes de ${year}`;win(movie,`${year}-01-01`,`${year}-12-31`);
 if(!seas.sources.some(s=>s.title==="Estreias da temporada"))seas.sources.push(cp(seasonTmdb[0],"Estreias da temporada"));
 const ss=seas.sources.find(s=>s.title==="Estreias da temporada");ss.sortBy="first_air_date.desc";win(ss,quarterStart,today<quarterEnd?today:quarterEnd);
 for(const s of find("hub-anime","anime-upcoming").sources.filter(s=>s.provider==='tmdb'))win(s,coming,upTo);
 const se=find("hub-series","series-airing");se.title="Séries novas e populares";win(se.sources[0],dateOffset(today,-120),today);
 for(const id of ["asia-kdramas","asia-jdramas","asia-cdramas"]){const s=find("hub-asia",id).sources[0];win(s,dateOffset(today,-120),today);s.filters.withGenres=null;s.filters.withoutGenres="16";}
 const asia=data.find(h=>h.id==="hub-asia");
 let newAsia=asia.folders.find(f=>f.id==="asia-new-dramas");
 if(!newAsia){
  newAsia=JSON.parse(JSON.stringify(find("hub-asia","asia-kdramas")));
  newAsia.id="asia-new-dramas";newAsia.title="Novos doramas";newAsia.sources=[];
  newAsia.coverImageUrl=next+"covers/asia-doramas/asia-kdramas-v1.webp";
  for(const [country,language,label] of [["KR","ko","Coreia do Sul"],["JP","ja","Japão"],["CN","zh","China"],["TW","zh","Taiwan"],["TH","th","Tailândia"]]){
   const s=cp(find("hub-asia","asia-kdramas").sources[0],label);
   s.sortBy="first_air_date.desc";s.filters.withOriginCountry=country;s.filters.withOriginalLanguage=language;s.filters.withGenres=null;s.filters.withoutGenres="16";
   win(s,dateOffset(today,-120),today);newAsia.sources.push(s);
  }
  const tvn=cp(newAsia.sources[0],"tvN · Coreia");tvn.filters.withNetworks="866";newAsia.sources.push(tvn);
  asia.folders.unshift(newAsia);
 }else for(const s of newAsia.sources)win(s,dateOffset(today,-120),today);
 const anime=data.find(h=>h.id==="hub-anime");
 let newAnime=anime.folders.find(f=>f.id==="anime-new-releases");
 if(!newAnime){
  newAnime=JSON.parse(JSON.stringify(seas));
  newAnime.id="anime-new-releases";newAnime.title="Novos animes";newAnime.coverImageUrl=next+"covers/anime/anime-current-season-v1.webp";
  newAnime.sources=[];
  for(const [title,media,days] of [["Estreias de séries","TV",120],["Filmes recém-lançados","MOVIE",180]]){
   const s=cp(seas.sources[0],title);s.mediaType=media;s.sortBy=media==="TV"?"first_air_date.desc":"primary_release_date.desc";
   win(s,dateOffset(today,-days),today);newAnime.sources.push(s);
  }
  anime.folders.unshift(newAnime);
 }else for(const s of newAnime.sources)win(s,dateOffset(today,s.mediaType==="TV"?-120:-180),today);
 return data;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const path=process.argv[2] || 'collections.json';
  const today=process.argv[3] || new Date().toISOString().slice(0,10);
  const data=JSON.parse(readFileSync(path,'utf8'));
  const next=refreshCollections(data,today);
  const ids=next.flatMap(h=>h.folders.map(f=>f.id));
  if(new Set(ids).size!==ids.length)throw Error('Duplicate folder IDs');
  writeFileSync(path,JSON.stringify(next,null,1)+'\n');
  console.log('Refreshed',today,'hubs:',next.length,'folders:',ids.length);
}
