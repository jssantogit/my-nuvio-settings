# My Nuvio Settings

Minha configuração de coleções e capas para o **Nuvio**. O arquivo principal está versionado aqui para facilitar ajustes, auditoria e importação.

## Importar as coleções

**[collections.json](./collections.json)** — arquivo completo para importar no Nuvio.

Na página de [coleções do Nuvio](https://nuvio.tv/account?tab=collections), use **Import** e selecione este JSON. Para substituir a configuração anterior, faça backup e escolha **Replace** (em vez de Add, que pode duplicar as coleções). Reinicie/atualize o aplicativo se necessário.

## Organização

- `collections.json` — 13 categorias principais, 175 subcoleções e 744 fontes, com datas iniciais de 01/11/2026.
- `covers/` — capas e fundos existentes; os caminhos e nomes foram preservados.
- `scripts/refresh-collections.mjs` — renova datas de temporada, recentes e próximos lançamentos.
- `tests/` — testes de regressão dos filtros e estrutura.
- `scripts/enhance-collections.mjs` — integra catálogos reais de episódios e valida IDs personalizados do AIO Metadata.
- `.github/workflows/refresh-collections.yml` — atualização mensal e manual do arquivo publicado.
- [`docs/INTEGRACOES.md`](./docs/INTEGRACOES.md) — requisitos dos addons, instalação e autenticação de catálogos AniList personalizados.
- [`docs/CURADORIA.md`](./docs/CURADORIA.md) — critérios, limitações, diferenças entre estreia e nova temporada, fonte coreana usada como referência.

### Sobre a atualização

Os catálogos consultam TMDB/Trakt para obter os títulos, mas **as datas de filtro são valores fixos no JSON importado**. O repositório renova o JSON mensalmente; para acompanhar essas novas janelas, é necessário **importá-lo novamente no Nuvio**. A mudança no GitHub sozinha não altera a configuração que já está na conta.

### Requisitos das novas fontes

A configuração inclui fontes de episódios de **AIO Metadata** (ID `aio-metadata`) e do addon **Nuvio Anime & Kids** (ID `community.nuvio.animekids`). O JSON é importável mesmo sem os addons, mas essas fontes não renderizam até que o addon correspondente esteja instalado e o catálogo esteja habilitado no Nuvio. O segundo addon precisa de uma instância acessível (é auto-hospedável). Não há instância pessoal presumida.

As categorias Shounen, Seinen, Shoujo/Josei e Isekai continuam marcadas como **aproximações temáticas** enquanto não houver IDs reais de catálogos AniList personalizados. O script só instala um catálogo de demografia depois de verificar sua presença no manifesto do AIO. Veja [o guia de integração](./docs/INTEGRACOES.md).

### Principais melhorias

- Estreias de anime e doramas asiáticos com janelas temporais e sem bloqueio por votos mínimos.
- Seção específica de novos doramas (Coreia, Japão, China, Taiwan, Tailândia e tvN) e novos animes.
- Temporada de anime calculada por trimestre; futuros lançamentos começam após a data atual.
- Renomeadas seções cujo título prometia atualidade ou ranking semanal não comprovado.
- Nova seção de episódios em exibição para séries; calendário de anime e temporada sazonal com fontes verificadas de addon.
- Nenhum `catalogId` de demografia foi inventado; fontes aproximadas ficam explicitamente identificadas.
- URLs das capas do antigo `nuvio-covers` trocadas pelas imagens existentes neste repositório.

> A TMDB usa principalmente a **primeira data de estreia da série**, não o calendário de temporadas/episódios novos. Consulte [CURADORIA](./docs/CURADORIA.md) para limites e possíveis melhorias futuras.
