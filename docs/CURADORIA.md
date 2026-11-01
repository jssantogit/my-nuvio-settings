# Curadoria e atualização das coleções

## O que significa "recente"

| Coleção | Critério do JSON | Limitação |
| --- | --- | --- |
| Novos animes / séries | TV japonesa com gênero Animação (16), língua japonesa, origem JP, **primeira estreia** nos últimos 120 dias, sem mínimo de votos | Temporadas novas de anime antigo podem não aparecer |
| Novos animes / filmes | Filme japonês animado, lançamento nos últimos 180 dias | Datas da TMDB podem refletir cinema, não estreia em streaming |
| Temporada de anime atual | Séries animadas que estrearam no trimestre corrente | É trimestre de estreia; não é lista de episódios novos |
| Novos doramas | Primeira estreia nos últimos 120 dias, por idioma/país: KR, JP, CN, TW e TH | Não garante legenda, distribuição no Brasil ou novas temporadas |
| Novos doramas / tvN | Mesmo recorte coreano, com rede TMDB tvN (ID 866) | Pode perder co-produções cujo cadastro omite a emissora |
| Próximos lançamentos | Primeiro lançamento após hoje e até 365 dias adiante | Datas futuras da TMDB podem mudar |
| Descobrir / Lançamentos recentes | TV: últimos 120 dias; filmes: últimos 180 dias | Descobrir não significa que o título chegou ao streaming |
| Destaques do streaming | Listas externas TMDB/Trakt já existentes | Curadoria externa não equivale a estreia no serviço |

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

Verifique na prática títulos recentes conhecidos de **cada país**; se faltarem, investigue o cadastro TMDB (data de primeira estreia, idioma original, país de origem, gênero e emissora). Isso não pode ser diagnosticado só pelo JSON. A TMDB Discover não fornece, nesta configuração, um calendário completo de novos episódios, temporadas sequenciais ou disponibilidade real de streaming. Para isso seria necessária fonte própria de temporadas/episódios (por exemplo um addon) e testes com dados reais.

Capas: imagens já existentes em [`covers/`](../covers/) e URLs apontando para este repositório. Algumas imagens externas permanecem intocadas.
