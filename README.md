# LinkPulse Campaign Links

LinkPulse Campaign Links é um encurtador de URLs comercial para times de marketing, agências e pequenos negócios que precisam criar links de campanha, acompanhar canais, visualizar QR codes e expor uma API simples.

Não é um encurtador de brinquedo. O projeto modela um fluxo real de serviço: criar links rastreáveis, segmentar cliques por canal e dispositivo, monitorar qualidade de conversão e entregar endpoints prontos para campanhas.

## Valor Comercial

- Ajuda agências a provar desempenho de campanhas com métricas de clique e conversão.
- Dá ao time comercial links rastreáveis para Workana, WhatsApp, email e anúncios pagos.
- Gera ativos de campanha prontos para QR em lojas, panfletos e eventos.
- Demonstra API backend, dashboard, validação e lógica de analytics.
- Roda com dados seed e sem banco externo, então é fácil de demonstrar em proposta.

## Funcionalidades

- Criação de links curtos com slug, campanha, canal e campos UTM.
- Endpoint de redirecionamento com registro de clique: `/r/:slug`.
- Analytics por link, campanha, canal, dispositivo e conversão.
- Preview visual de QR gerado a partir do slug.
- Alertas de risco para baixa conversão e links pausados.
- Dados seed em JSON, endpoints documentados, testes e Dockerfile.

## Stack

- Servidor HTTP nativo em Node.js 20+
- ES modules
- Dashboard em JavaScript puro
- UI responsiva em CSS
- Armazenamento seed em JSON
- Test runner nativo do Node

## Como Rodar Localmente

```bash
npm install
npm run check
npm test
npm run smoke
npm start
```

Acesse:

```text
http://localhost:3000
```

## Preview da API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/links`
- `POST /api/links`
- `GET /api/links/:slug/analytics`
- `GET /r/:slug`

Veja [docs/api-endpoints.md](docs/api-endpoints.md).

## Dados de Demonstração

Os dados seed em [data/seed.json](data/seed.json) incluem quatro links ativos/pausados e 14 eventos de clique em campanhas de Workana, email, WhatsApp e QR.

## Deploy

Docker:

```bash
docker build -t linkpulse-campaign-links .
docker run -p 3000:3000 linkpulse-campaign-links
```

Host Node genérico:

```bash
npm install --omit=dev
npm start
```

## Melhorias Comerciais

- Persistência em PostgreSQL.
- Contas de equipe e workspaces por cliente.
- Exportação real de QR em PNG.
- Domínios customizados.
- Webhooks para CRM e plataformas de anúncios.
- Detecção de abuso e regras de expiração de links.
