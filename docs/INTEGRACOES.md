# Integrações de episódios e taxonomia AniList

## Objetivo e funcionamento

A TMDB Discover do Nuvio usa `first_air_date` para filtrar séries. Isso identifica **estreia de séries**, não a estreia de temporadas novas ou capítulos de produções antigas. Por isso os catálogos abaixo são externos ao TMDB Discover. A importação do JSON não instala addons automaticamente.

| Coleção | ID real da fonte | Addon (manifest.id) | Depende de |
| --- | --- | --- | --- |
| Episódios em exibição / Hoje | `tmdb.airing_today` | `aio-metadata` | AIO Metadata instalado e catálogo habilitado |
| Episódios em exibição / Grade | `tvmaze.schedule` | `aio-metadata` | AIO Metadata e catálogo habilitado |
| Anime / Recém-exibidos | `recently-aired` | `community.nuvio.animekids` | Nuvio Anime & Kids instalado |
| Anime / Episódios recentes | `latest-episodes` | `community.nuvio.animekids` | Nuvio Anime & Kids instalado |
| Anime / Hoje | `airing-today` | `community.nuvio.animekids` | Nuvio Anime & Kids instalado |
| Anime / Temporada atual | `seasonal` | `community.nuvio.animekids` | Addon instalado, `genre=This season` |
| Anime / Próxima temporada | `seasonal` | `community.nuvio.animekids` | Addon instalado, `genre=Next season` |
| Anime / Em alta | `anilist.trending` | `aio-metadata` | AniList configurado e catálogo habilitado no AIO |

**Verificação técnica:** os identificadores acima aparecem, respectivamente, no código de [AIO Metadata](https://github.com/cedya77/aiometadata/blob/dev/configure/src/data/catalogs.ts) e nas [definições de catálogo de Nuvio Anime & Kids](https://github.com/demdex/nuvio-anime/blob/main/src/anime/catalogs.js). O manifesto real de cada instância deve ter os mesmos valores.

### Instalação

1. Configure e instale [AIO Metadata](https://github.com/cedya77/aiometadata) no Nuvio. Ative explicitamente os catálogos `tmdb.airing_today`, `tvmaze.schedule` e `anilist.trending`. Confira que o manifest ID recebido no Nuvio é `aio-metadata`.
2. Para calendário de **anime por episódio**, hospede [Nuvio Anime & Kids](https://github.com/demdex/nuvio-anime) no servidor HTTPS de sua preferência e instale o manifesto no Nuvio. Esse repositório não possui URL pública oficial de instalação garantida; não inventamos uma instância. Confira o `manifest.id` `community.nuvio.animekids` e os catálogos.
3. Importe `collections.json` no Nuvio em modo de substituição. Verifique a carga das pastas e compare séries/animes com datas conhecidas. Catálogo não instalado/ativado pode aparecer vazio. A ausência da fonte não impede os demais filtros TMDB de funcionar.
4. O GitHub Actions renova as **datas TMDB no repositório**, não as configurações já importadas no Nuvio. Os catálogos de addons consultam as próprias fontes em cada atualização, sujeitos a cache.

### Segurança / compatibilidade

- Nunca publique URLs de configuração privada, tokens, nomes de usuário vinculados a listas privadas ou API keys no repositório. Guarde manifestos de instâncias configuradas **fora** do Git.
- O sistema não informa por si só se o conteúdo está disponível legalmente para assistir no Brasil.
- Jikan público foi descontinuado em 1º/10/2026; não usamos seus catálogos MAL como novas fontes.
- Em anime, a opção sem conteúdo adulto deve ser habilitada no addon; `isAdult:false` não elimina automaticamente todo conteúdo Ecchi.

## Demografia e temas verdadeiros via AniList

As pastas `anime-shounen`, `anime-seinen`, `anime-shoujo-josei` e `anime-isekai-fantasy` tinham **aproximações TMDB**, não filtros demográficos. Elas agora são identificadas como tal enquanto os catálogos especializados não estiverem disponíveis.

O [AniList GraphQL](https://docs.anilist.co/reference/query) suporta `isAdult:false`, `genre_not_in`, `tag_in` e filtros de país. Configure, na sua instância do AIO Metadata, catálogos **AniList Discover** para cada conceito, verificando os nomes de tags aceitos pelo AniList e observando diferenças entre gêneros, tags e demografias. Use `isAdult:false`, exclua `Ecchi` e limite `countryOfOrigin` a `JP`. Para Shoujo e Josei juntos, um catálogo precisa aplicar a união dos dois grupos, não a interseção. Para Isekai, use a tag própria quando disponível, nunca fantasia genérica como sinônimo.

Após criar os catálogos no painel AIO, obtenha o manifesto do **addon já configurado** (localmente, sem colocar a URL privada no repositório), identifique os IDs exatos `anilist.discover.*` e confirme seus respectivos tipos `anime`. Preencha uma cópia de [`config/anilist-catalog-map.example.json`](../config/anilist-catalog-map.example.json) com a correspondência entre pasta e catálogo.

Exemplo dos comandos locais, mantendo o manifesto e o mapeamento fora do repositório:

```bash
cp config/anilist-catalog-map.example.json /tmp/nuvio-catalog-map.json
# Edite /tmp/nuvio-catalog-map.json usando IDs confirmados do manifest AIO
node scripts/enhance-collections.mjs collections.json /tmp/aio-manifest.json /tmp/nuvio-catalog-map.json
node --test tests/*.test.mjs
```

O script rejeita IDs não existentes, tipos incompatíveis, IDs fora de `anilist.discover.*` e nomes de pastas desconhecidos. Quando um ID é confirmado, **substitui** as fontes TMDB aproximadas daquela pasta por um catálogo AniList específico, mantendo o ID e a capa da pasta.

Sem o manifesto da instância do usuário, **não há como confirmar esses IDs nem garantir filtros ativados**; portanto o repositório não declara que a parte demográfica já esteja completa.

## Testes e verificações

```bash
node --test tests/*.test.mjs
node scripts/refresh-collections.mjs collections.json 2027-01-05
```

O segundo comando renova o próprio arquivo: rode em uma cópia ou restaure o arquivo antes de commit. Os testes conferem idempotência, preservação de IDs, compatibilidade de fontes e validação de catálogo. O teste de execução no Nuvio real permanece necessário para cada instância de addon.
