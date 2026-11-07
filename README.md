# My Nuvio Settings

Minha configuração de coleções e capas para o **Nuvio**. O arquivo principal está versionado aqui para facilitar ajustes, auditoria e importação.

## Importar as coleções

**[collections.json](./collections.json)** — arquivo completo para importar no Nuvio.

Na página de [coleções do Nuvio](https://nuvio.tv/account?tab=collections), use **Import** e selecione este JSON. Para substituir a configuração anterior, faça backup e escolha **Replace** (em vez de Add, que pode duplicar as coleções). Reinicie/atualize o aplicativo se necessário.

## Organização

- `collections.json` — 13 categorias principais, 172 subcoleções e 735 fontes, com janelas de estreia atualizadas em 07/11/2026.
- `covers/` — capas e fundos existentes; os caminhos e nomes foram preservados.
- `scripts/refresh-collections.mjs` — renova datas de temporada, recentes e próximos lançamentos.
- `tests/` — testes de regressão dos filtros e estrutura.
- `scripts/enhance-collections.mjs` — integra catálogos reais de episódios e valida IDs personalizados do AIO Metadata.
- `.github/workflows/refresh-collections.yml` — atualização mensal e manual do arquivo publicado.
- [`docs/INTEGRACOES.md`](./docs/INTEGRACOES.md) — requisitos dos addons, instalação e autenticação de catálogos AniList personalizados.
- [`docs/CURADORIA.md`](./docs/CURADORIA.md) — critérios, limitações, diferenças entre estreia e nova temporada, fonte coreana usada como referência.

### Sobre a atualização

Os catálogos consultam TMDB/Trakt para obter os títulos, mas **as datas de filtro são valores fixos no JSON importado**. O repositório renova o JSON mensalmente; para acompanhar essas novas janelas, é necessário **importá-lo novamente no Nuvio**. A mudança no GitHub sozinha não altera a configuração que já está na conta.

### Compatibilidade com os addons instalados

Em 01/11/2026, foi conferido o manifesto configurado pelo usuário para AIO Metadata 3.8.3: tem ID `aio-metadata`, mas expõe **9 catálogos**, nenhum deles `tmdb.airing_today`, `tvmaze.schedule` ou `anilist.trending`. Por isso a configuração publicada **não contém** essas fontes nem depende do Nuvio Anime & Kids.

A atualização anterior havia incluído fontes existentes no código dos addons, mas **ausentes do manifesto efetivamente instalado**. Essa diferença gerou abas quebradas no Nuvio. O script `scripts/enhance-collections.mjs` agora só adiciona catálogos quando um **manifesto local real** comprova ID e tipo. Nenhum URL privado, token ou identificador individual do usuário é armazenado no repositório.

Categorias de anime exibem títulos curtos (por exemplo, `Shounen`, `Seinen`, `Shoujo e josei` e `Isekai e fantasia`). A qualidade e as limitações das classificações TMDB permanecem documentadas, nunca no título da pasta.

Leia [Integrações](./docs/INTEGRACOES.md) para habilitar fontes externas opcionais, se elas passarem a constar do seu manifesto.

### Critérios atuais de lançamentos

- **Lançamentos recentes:** mantém ordenação por data de estreia e utiliza apenas um piso leve de votos no TMDB: filmes ≥10, séries e documentários ≥5, animes ≥3. Não confundir com uma nota mínima de avaliação.
- **Animes da temporada:** uma única pasta reúne destaques do trimestre, estreias recentes, filmes e melhores avaliados; a duplicação entre `Novos animes` e `Temporada de anime atual` foi eliminada sem perder suas fontes.
- **K-dramas:** obras coreanas, incluindo uma aba `tvN · recentes`, concentradas na pasta `K-dramas`.
- **Outros:** novidades japonesas, chinesas, taiwanesas e tailandesas. Sem capa e sem logo coreano.
- **Lançamentos de nicho:** usam mínimo de 3 votos (séries asiáticas e animes), e 5 em filmes de anime, para reduzir ruído sem excluir tudo que ainda está ganhando reconhecimento.
- **Atualização:** as datas e os critérios são mantidos por `scripts/refresh-collections.mjs`. O GitHub atualiza o JSON mensalmente, mas é preciso reimportar no Nuvio.
- Os catálogos adicionais de addons continuam condicionados ao manifesto instalado e não fazem parte do JSON padrão sem validação.

> Uma pequena contagem mínima de votos melhora o sinal de reconhecimento, mas não garante qualidade, relevância editorial nem disponibilidade em streaming. A TMDB usa `first_air_date` de séries, não o calendário completo de novas temporadas/episódios. Consulte [CURADORIA](./docs/CURADORIA.md).
