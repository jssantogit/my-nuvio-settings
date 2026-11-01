# My Nuvio Settings

Minha configuração de coleções e capas para o **Nuvio**. O arquivo principal está versionado aqui para facilitar ajustes, auditoria e importação.

## Importar as coleções

**[collections.json](./collections.json)** — arquivo completo para importar no Nuvio.

Na página de [coleções do Nuvio](https://nuvio.tv/account?tab=collections), use **Import** e selecione este JSON. Para substituir a configuração anterior, faça backup e escolha **Replace** (em vez de Add, que pode duplicar as coleções). Reinicie/atualize o aplicativo se necessário.

## Organização

- `collections.json` — 13 categorias principais, 173 subcoleções e 736 fontes, com datas iniciais de 01/11/2026.
- `covers/` — capas e fundos existentes; os caminhos e nomes foram preservados.
- `scripts/refresh-collections.mjs` — renova datas de temporada, recentes e próximos lançamentos.
- `tests/` — testes de regressão dos filtros e estrutura.
- `.github/workflows/refresh-collections.yml` — atualização mensal e manual do arquivo publicado.
- [`docs/CURADORIA.md`](./docs/CURADORIA.md) — critérios, limitações, diferenças entre estreia e nova temporada, fonte coreana usada como referência.

### Sobre a atualização

Os catálogos consultam TMDB/Trakt para obter os títulos, mas **as datas de filtro são valores fixos no JSON importado**. O repositório renova o JSON mensalmente; para acompanhar essas novas janelas, é necessário **importá-lo novamente no Nuvio**. A mudança no GitHub sozinha não altera a configuração que já está na conta.

### Principais melhorias

- Estreias de anime e doramas asiáticos com janelas temporais e sem bloqueio por votos mínimos.
- Seção específica de novos doramas (Coreia, Japão, China, Taiwan, Tailândia e tvN) e novos animes.
- Temporada de anime calculada por trimestre; futuros lançamentos começam após a data atual.
- Renomeadas seções cujo título prometia atualidade ou ranking semanal não comprovado.
- URLs das capas do antigo `nuvio-covers` trocadas pelas imagens existentes neste repositório.

> A TMDB usa principalmente a **primeira data de estreia da série**, não o calendário de temporadas/episódios novos. Consulte [CURADORIA](./docs/CURADORIA.md) para limites e possíveis melhorias futuras.
