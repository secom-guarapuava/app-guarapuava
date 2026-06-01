# Guarapuava Digital — Protótipo

**Serviços, notícias e orientações da Prefeitura em um só lugar.**

Protótipo navegável e de alta fidelidade do app oficial da Prefeitura de Guarapuava. Foco desta etapa: layout, experiência, hierarquia visual e uma base escalável — sem login, sem cadastro e sem coleta de dados pessoais (compatível com a LGPD).

---

## 1. Como abrir e hospedar

**Abrir no computador:** dê dois cliques em `index.html`. Abre em qualquer navegador, sem instalar nada.

**Ver no formato celular:** abra no Chrome, tecle `F12`, clique no ícone de celular/tablet (Toggle device toolbar) e escolha um iPhone. Em telas pequenas o app já ocupa a tela inteira automaticamente.

**Publicar online (recomendado):** suba os arquivos para um repositório no GitHub e ative o GitHub Pages — exatamente como foi feito com a página UPA/UBS. O `index.html` já é o arquivo de entrada. Em segundos você terá um link para compartilhar com a equipe e os secretários.

> **Brasão:** o header mostra o `brasao.png` — o brasão oficial transparente, direto sobre o azul, **sem selo branco e sem texto embaixo**. Se ele faltar, o app cai automaticamente no `brasao-guarapuava.png`. O `brasao-icon.png` é o ícone da aba do navegador; `BRASAO_OFC1.png` é o brasão oficial em alta (fonte) e `BRASÃO_AZUL.png` é a versão azul antiga (backup). Os ícones do app instalado (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) trazem o brasão sobre fundo azul institucional. Todos devem ficar na **mesma pasta** do `index.html`. Para trocar o brasão depois, basta substituir o `brasao.png`.

### Testar no celular como app (PWA)

O protótipo já vem configurado como **PWA** — dá para abrir por um link no navegador do celular, com layout mobile fiel (safe area, barra inferior fixa, cards e telas internas) e até **instalar na tela inicial**, sem App Store nem Play Store.

1. **Publique os arquivos** (GitHub Pages é o caminho mais simples — já dá um link `https://`, que é necessário para a instalação funcionar).
2. **Abra o link no celular.** Em tela pequena o app ocupa a tela inteira automaticamente.
3. **Instale:** vá em **Mais → Instalar na tela inicial**. No Android (Chrome) aparece o convite de instalação; no iPhone (Safari), toque em **Compartilhar → Adicionar à Tela de Início**. O app passa a abrir como aplicativo, em tela cheia, com o ícone do brasão.

Depois de instalado, o app abre offline (o `sw.js` guarda a interface em cache). Abrir o `index.html` direto do computador (`file://`) funciona para visualizar, mas a instalação e o modo offline só ativam quando servido por um link `http(s)://`.

> **Arquivos do PWA:** `manifest.json` (nome, ícones, tema azul, tela cheia), `sw.js` (cache offline) e os quatro ícones do app. Todos ao lado do `index.html`. Nada disso coleta dado pessoal.

---

## 2. Arquitetura de telas

Navegação inferior com 5 abas + telas de apoio:

```
(Abertura: splash azul animado → assistente de boas-vindas na 1ª vez)

[ Início ]  [ Serviços ]  [ Saúde ]  [ Avisos ]  [ Mais ]
    │            │            │          │          │
    │            │            │          │          ├─ Canais oficiais (links externos)
    │            │            │          │          ├─ Telefones úteis
    │            │            │          │          ├─ Instalar na tela inicial
    │            │            │          │          ├─ Assistente e meus interesses
    │            │            │          │          ├─ Política de privacidade (LGPD)
    │            │            │          │          └─ Meus interesses (temas + bairro)
    │            │            │          └─ Mapa placeholder + cards de bloqueio
    │            │            └─ UBS x UPA, quando ir, apoio, telefones
    │            └─ Categorias (chips) + cards de serviço → sistemas oficiais
    ├─ Saudação + busca + notícias + carta de serviços + atalhos + avisos
    └─ Notícias (lista) → Detalhe interno → "Ler no site oficial"

[ Sino no topo ] → Notificações (Urgente, Serviços, Saúde, Trânsito, Notícias, Eventos)

[ admin.html ] → Painel de gestão (acessos, telas, bairros) — ARQUIVO SEPARADO, acesso restrito
```

Telas do app público: **Início, Serviços, Saúde, Avisos/Trânsito, Notícias, Detalhe da notícia, Notificações e Mais**, mais o **assistente de boas-vindas** e a **tela de abertura (splash)**.

> **Painel de gestão saiu do app público.** Os números de acesso não devem ser visíveis ao cidadão, então o painel virou um arquivo separado, **`admin.html`**, de uso interno. Ele **não fica linkado** no app. Antes de publicar, proteja-o com login real (ex.: Firebase Auth) ou restrição da hospedagem.

---

## 3. Onde editar conteúdo, links e dados

Tudo fica em **um único objeto `CONFIG`** no topo da tag `<script>` dentro do `index.html`. Não precisa mexer em mais nada. Quando for integrar com uma API no futuro, basta trocar esses arrays por chamadas `fetch()` mantendo o mesmo formato.

| O que mudar | Onde, dentro de `CONFIG` |
|---|---|
| Links oficiais (IPTU, guias, protocolo, ouvidoria, autoatendimento, UPA/UBS, +Negócios, Instagram) | `links` |
| Notícias (título, resumo, data, categoria, cor, URL) | `noticias` |
| Serviços e suas categorias | `servicos` / `servCategorias` |
| Conteúdo de saúde (quando ir UBS/UPA, cards educativos, telefones) | `saude` |
| Bloqueios de rua (rua, trecho, data, motivo, status, previsão, mapa) | `blocos` |
| Notificações | `notificacoes` |
| Temas de interesse do assistente | `topicos` |
| Lista de bairros (assistente / avisos) | `bairros` |
| Números do painel de gestão | em `admin.html` (arquivo separado) |

Os links de serviço aceitam dois formatos: `url:"links.iptu"` (aponta para o `links`) ou uma URL direta. Itens internos usam `screen:"saude"`.

**Planilha pronta (`Guarapuava-Digital-CONTEUDO.xlsx`):** abra no Google Sheets (Arquivo → Importar, ou suba no Drive) para editar conteúdo sem mexer no código. Tem abas para Notícias, Bloqueios (com latitude/longitude p/ o mapa), Notificações, Bairros, Tópicos e Links, com menus suspensos e uma aba de Instruções. É a base do "painel" de quem vai abastecer o app — cada secretaria edita a sua aba (proteja por aba em Dados → Proteger intervalos).

**Assistente "Ana" (boas-vindas + ajuda permanente):** na 1ª abertura ela dá boas-vindas (rápido) e pergunta temas de interesse e bairro. Depois disso, fica um **botão flutuante "Ajuda"** em todas as telas: a pessoa toca quando precisar e a Ana **leva direto** ao que quer (notícias, serviços/IPTU, saúde, avisos) e responde dúvidas rápidas, com botões que abrem a tela ou o sistema oficial. As escolhas de interesse ficam **só no aparelho** (sem dado pessoal) e servem para priorizar notícias e, no futuro, direcionar os pushs por tema/bairro. Dá pra reabrir/editar em **Mais → Assistente e meus interesses**. (Hoje é um fluxo guiado; pode virar um chat de IA com respostas livres depois, via API.)

---

## 4. Design system (resumo)

**Cores** — azul institucional moderno em escala (`--azul-50` a `--azul-900`), com `#0B3D91` e `#1565E0` como base, mesma linha da página UPA/UBS. Gradientes pontuais em destaques e header. Neutros para texto/linhas e cores de feedback (verde/âmbar/vermelho/azul), sempre acompanhadas de **ícone + texto** — nunca só cor — para indicar urgência.

**Tipografia** — fonte do sistema (rápida e legível), corpo a partir de 15px, títulos 800. **Espaçamento** generoso. **Raios** arredondados (cards 15–20px, botões 14px, chips totais). **Sombras** discretas.

**Componentes reutilizáveis** — header institucional, busca, card de destaque (gradiente), cards de serviço, cards de notícia, cards de alerta (4 níveis), botões (primário/claro/fantasma/perigo), chips de filtro, barra inferior, tela de detalhe, **mapa real (Leaflet/OpenStreetMap)** com pinos por status, **assistente em chat dinâmico** (balões + "digitando"), splash de abertura, cards educativos de saúde, linhas de contato.

**Acessibilidade** — bom contraste, alvos de toque grandes, ícones sempre com rótulo, linguagem simples e direta nos botões ("Emitir guia", "Ver no mapa", "Ler no site oficial").

---

## 5. Painel de dados (controle de fluxo) e LGPD

Atende ao seu pedido de acompanhar **acessos, notificações entregues e alcance por bairro**, sem ferir a LGPD: os números são **agregados e anônimos** (totais de uso, nenhum dado que identifique uma pessoa). No protótipo são simulados. Para produção, integre um analytics anônimo (ex.: **Matomo** ou **Firebase com IP anonimizado**) e a contagem de entregas do serviço de push — sempre sem cadastro e sem dado pessoal.

---

## 6. Próximos passos sugeridos

1. **Validar visualmente** com a equipe e secretários (publicar no GitHub Pages e circular o link).
2. **Revisar conteúdo e URLs** reais de cada serviço (a Carta de Serviços tem links específicos por serviço).
3. **Notícias automáticas** — conectar ao site oficial via feed/RSS ou API, substituindo o array `noticias`.
4. **Mapa real** — ✅ já implementado com **Leaflet + OpenStreetMap** (grátis, sem chave) na tela de Avisos, com os bloqueios geolocalizados (lat/long). Opcional trocar por Google Maps depois (exige chave de API + conta de faturamento Google Cloud).
5. **Push de verdade** — integrar o **Firebase Cloud Messaging** mantendo o opt-in anônimo. O app já captura interesses (temas) e bairro para direcionar os pushs por **tópicos** (ex.: `eventos`, `bairro_centro`, `noticias_saude`).
6. **Analytics anônimo** para alimentar o Painel com dados reais.
7. **Porte para React Native + Expo** quando for publicar nas lojas: o design system (cores, tipografia, espaçamentos), a arquitetura de telas e o formato dos dados deste protótipo foram pensados para migrar quase 1:1.

---

*Protótipo • versão 0.5 (assistente de ajuda com botão flutuante + chat dinâmico + mapa real) • ajustável a qualquer momento.*
