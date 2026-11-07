# Curadoria e atualização das coleções

## O que significa "recente" — revisão de 07/11/2026

Os catálogos abaixo utilizam o `TMDB Discover`. `voteCountGte` representa **quantidade de votos**, não nota; isso evita títulos totalmente desconhecidos sem exigir avaliações elevadas que poderiam excluir estreias novas.

| Coleção | Janela e filtro | Limitação |
| --- | --- | --- |
| Descobrir → Lançamentos recentes | Séries: últimos 120 dias e ≥5 votos; filmes: últimos 180 dias e ≥10 votos; anime TV: ≥3 votos; documentários: ≥5 votos | Primeira estreia não equivale a episódio novo nem chegada a streaming |
| Séries novas e populares → Novas séries | Últimos 120 dias e ≥5 votos | Ordenação por primeira estreia, não por nova temporada |
| Animes da temporada → Destaques/Estreias/Melhores | Trimestre atual até hoje; ≥3 votos para destaques/estreias, ≥5 para melhores | Temporadas de continuações podem aparecer como série antiga no TMDB |
| Animes da temporada → Estreias recentes | Séries de anime japonesas: últimos 120 dias e ≥3 votos | Os dias recentes podem atravessar trimestres |
| Animes da temporada → Filmes recentes | Filmes animados japoneses: últimos 180 dias e ≥5 votos | Datas da TMDB podem refletir cinema e não streaming |
| Animes da temporada → Filmes do ano | Filmes de anime de 1º de janeiro até hoje, ≥5 votos | Critério anual, não somente da temporada de anime |
| K-dramas → Recentes / tvN · recentes | Obras coreanas nos últimos 120 dias, ≥3 votos; tvN limitada à rede 866 | O cadastro da TMDB pode omitir a emissora |
| Outros → Japão, China, Taiwan, Tailândia | Séries com país/idioma correspondentes e últimos 120 dias, ≥3 votos; exclui Animação (16) | Agrupamento por origem, não é uma categoria de K-drama |
| Próximos lançamentos | Estreia prevista para 1 a 365 dias à frente; sem filtro mínimo de votos | Obras ainda não lançadas costumam ter zero votos |
| Destaques do streaming | Listas externas TMDB/Trakt já existentes | Curadoria externa não equivale a estreia no serviço |

**Nomenclatura:** neste catálogo, *dorama/K-drama* designa obras da **Coreia do Sul**. Por isso os lançamentos coreanos ficam em `K-dramas`. A pasta `Outros` abrange J-dramas, C-dramas e séries de Taiwan/Tailândia, sem reutilizar a capa nem o logo de K-drama.

**Curadoria:** o piso de 3–10 votos é intencionalmente leve e não foi validado contra uma amostra editorial de lançamentos em tempo real; se ainda aparecer ruído, revisar os resultados por país e mídia antes de elevar o piso. Não aplicar médias mínimas de estrelas automaticamente, nem usar popularidade para fingir ranking real.

**Importante:** o Nuvio recebe um instantâneo deste JSON quando você o importa. O GitHub Actions renova o arquivo do repositório todo dia 1, mas **não atualiza automaticamente as coleções já importadas na sua conta**. Faça um novo import escolhendo **Replace**. Se o importador passar a oferecer sincronização por URL, o fluxo poderá ser revisitado.

## Alterar as coleções

A fonte de verdade é [`collections.json`](../collections.json). Preserve IDs de hubs/subcoleções e a estrutura de cada `source`. Para alterar janelas móveis, edite `scripts/refresh-collections.mjs`, nunca apenas as datas resolvidas no JSON.

Execução local:

```bash
node --test tests/refresh-collections.test.mjs
node scripts/refresh-collections.mjs collections.json
```

O script não usa chaves de API. O workflow mensal mantém o arquivo publicado atualizado e também permite execução manual via **Actions → Atualizar janelas de lançamentos Nuvio → Run workflow**. A ação não dispara a atualização do Nuvio instalado.

## Origem da coleção coreana usada como referência

O arquivo [`xperience_korean_collection.json`](https://github.com/eichicionizuka82/nuvio_korean_collection/blob/main/xperience_korean_collection.json) é um perfil **Xperience**, contendo entre outros fontes MDBList e listas TMDB. Ele **não** usa o mesmo formato de importação deste repositório. Foi aproveitada a ideia de combinar país com emissora (tvN), usando TMDB Discover, sem copiar o perfil ou depender de MDBList. A atualidade e a cobertura das listas do arquivo externo não foram verificadas.

## Como avaliar a qualidade

Verifique na prática títulos recentes conhecidos de **cada país**; se faltarem, investigue o cadastro TMDB (data de primeira estreia, idioma original, país de origem, gênero e emissora). Isso não pode ser diagnosticado só pelo JSON. A TMDB Discover não fornece, nesta configuração, um calendário completo de novas temporadas/episódios. Fontes externas de programação podem suprir essa lacuna, mas nenhuma foi ativada no arquivo público enquanto não houver manifesto instalado comprovando sua disponibilidade. As fontes propostas antes produziam erros no Nuvio e foram retiradas. O acesso efetivo a streams, legendas e distribuição no Brasil continua independente da listagem.

Capas: imagens já existentes em [`covers/`](../covers/) e URLs apontando para este repositório. Algumas imagens externas permanecem intocadas.

## Taxonomia de anime

Shounen, Seinen, Shoujo, Josei e Isekai não são equivalentes a Drama/Ação/Fantasia da TMDB. Até haver catálogos AniList reais configurados em uma instância AIO, as pastas antigas permanecem como **aproximação temática** — não como classificação autêntica. O guia [INTEGRACOES.md](./INTEGRACOES.md) documenta a validação dos IDs reais, receitas de filtros e como substituir essas sugestões sem criar IDs falsos.

A API pública Jikan usada por alguns catálogos MAL encerrou-se em outubro de 2026. Não foram adicionadas novas dependências dela. AIO Metadata pode fornecer catálogos via AniList, desde que configurados e efetivamente incluídos no manifesto instalado. O manifesto examinado em 01/11/2026 não oferece `anilist.trending` nem `anilist.discover.*`.
