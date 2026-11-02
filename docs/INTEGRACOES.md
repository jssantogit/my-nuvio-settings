# Integrações condicionais por manifesto real

## Diagnóstico do Nuvio em 01/11/2026

O manifesto configurado da instalação AIO Metadata foi analisado sem publicar URL privada, credenciais ou assinatura. Ele informa o addon ID `aio-metadata`, versão `3.8.3`, e **9 catálogos**: quatro linhas de streaming, dois catálogos de busca, `calendar-videos` e duas fontes `aiom.similar`. As fontes `tmdb.airing_today`, `tvmaze.schedule` e `anilist.trending` **não estão disponíveis nesta instalação**, embora apareçam no código upstream do AIO.

Antes, o JSON citava esses IDs, além de fontes do addon Nuvio Anime & Kids que não haviam sido confirmadas como instaladas. Isso causou abas de erro/vazias. Foram removidos da configuração padrão os oito vínculos não validados, e as duas pastas exclusivas de episódios que ficariam sem fontes.

O identificador `aio-metadata` **não era inventado**: ele coincide com o campo `id` do manifesto fornecido. A mensagem “Addon não encontrado” merece diagnóstico separado de timing/sincronização/seleção de perfil no próprio Nuvio, já que o app possui uma entrada visível para o addon. No código do Nuvio, o resolvedor `FolderDetailViewModel` consulta os addons ativos e procura exatamente o `addon.id` antes de solicitar um catálogo. O erro pode aparecer quando a lista devolvida nesse momento está vazia; isso é hipótese, não causa confirmada apenas pelas capturas.

## Regra para adicionar addons daqui em diante

1. Ler o **manifesto JSON da instalação real**, não apenas a lista de catálogos do repositório upstream.
2. Confirmar `manifest.id`, e para cada source a combinação EXATA de `catalog.id` e `catalog.type`.
3. Só criar a aba se o catálogo estiver no manifesto; se faltar, manter a coleção antiga sem fontes inválidas.
4. Para catálogos parametrizados por `genre`, conferir opções e `extraRequired`; nunca inventar parâmetros.
5. Não salvar URL de configuração individual, assinatura, token, API keys ou manifesto personalizado no repositório público.

## Ativação opcional

Se você ativar um catálogo especializado no [painel AIO Metadata](https://github.com/cedya77/aiometadata), poderá obter o **novo manifesto** e executá-lo localmente no validador, guardando-o fora do repositório:

```bash
node scripts/enhance-collections.mjs collections.json /tmp/aio-manifest.json
node --test tests/*.test.mjs
```

O validador só adicionará `tmdb.airing_today`, `tvmaze.schedule` e `anilist.trending` quando os respectivos IDs **e tipos** estiverem no manifesto do AIO. Sem o manifesto, o JSON fica livre dessas dependências.

O [Nuvio Anime & Kids](https://github.com/demdex/nuvio-anime) pode ser uma fonte de episódios quando uma instância estiver instalada e seu manifesto disponível. Use, se existir:

```bash
node scripts/enhance-collections.mjs collections.json /tmp/aio-manifest.json /tmp/anilist-map.json /tmp/anime-manifest.json
```

No primeiro comando, o segundo arquivo é opcional. No segundo, o mapa JSON pode ser `{}` se você não tiver criado catálogos demográficos.

### Catálogos de demografia AniList

As pastas continuam denominadas **Shounen**, **Seinen**, **Shoujo e josei** e **Isekai e fantasia**. Até existir um catálogo AniList específico, seus filtros antigos da TMDB fornecem apenas aproximações temáticas — isso fica documentado aqui, **não no título apresentado ao usuário**.

O modelo de mapeamento está em [`config/anilist-catalog-map.example.json`](../config/anilist-catalog-map.example.json). IDs do tipo `anilist.discover.*` só são aceitos após aparecerem no manifesto do AIO real com tipo `anime`. Configure `isAdult:false`, exclusão de Ecchi e os filtros apropriados na instância; não deduza público-alvo só pelos gêneros Drama/Ação/Fantasia.

## Verificações de funcionamento

O `collections.json` padrão funciona com fontes TMDB/Trakt sem exigir addons extras. As datas se atualizam mensalmente **apenas no arquivo do GitHub**; é necessário reimportá-lo no Nuvio para aplicar novas janelas. O rastreamento real de novos episódios de séries antigas continua pendente até ativar fontes especializadas verificadas.

O Nuvio diferencia:
- **estreia da série** (TMDB `first_air_date`);
- **estreia da temporada** (outra metadata especializada);
- **novo episódio** (grade de exibição);
- **chegada a um streaming** (disponibilidade por região/serviço).

Essa diferença deve ser preservada ao nomear catálogos.

## Referências técnicas

- [Nuvio — modelo de coleção](https://github.com/NuvioMedia/NuvioTV/blob/dev/app/src/main/java/com/nuvio/tv/domain/model/Collection.kt)
- [Nuvio — resolução dos catálogos de addon](https://github.com/NuvioMedia/NuvioTV/blob/dev/app/src/main/java/com/nuvio/tv/ui/screens/collection/FolderDetailViewModel.kt)
- [AIO Metadata — catálogo upstream](https://github.com/cedya77/aiometadata/blob/dev/configure/src/data/catalogs.ts)

