# LinkPulse - Links de Campanha

LinkPulse é um encurtador de URLs comercial para times de marketing, agências e pequenos negócios que precisam criar links de campanha, acompanhar canais, visualizar códigos QR e expor uma API simples.

Não é um encurtador de brinquedo. O projeto modela um fluxo real de serviço: criar links rastreáveis, segmentar cliques por canal e dispositivo, monitorar qualidade de conversão e entregar endpoints prontos para campanhas.

## Valor Comercial

- Ajuda agências a provar desempenho de campanhas com métricas de clique e conversão.
- Dá ao time comercial links rastreáveis para Workana, WhatsApp, email e anúncios pagos.
- Gera ativos de campanha prontos para QR em lojas, panfletos e eventos.
- Demonstra API, painel, validação e lógica de análise.
- Roda com dados de exemplo e sem banco externo, então é fácil de demonstrar em proposta.

## Funcionalidades

- Criação de links curtos com slug, campanha, canal e campos UTM.
- Endpoint de redirecionamento com registro de clique: `/r/:slug`.
- Análises por link, campanha, canal, dispositivo e conversão.
- Prévia visual de QR gerada a partir do identificador curto.
- Alertas de risco para baixa conversão e links pausados.
- Dados de exemplo em JSON, endpoints documentados, testes e Dockerfile.

## Tecnologias

- Servidor HTTP nativo em Node.js 20+
- ES modules
- Painel em JavaScript puro
- UI responsiva em CSS
- Armazenamento de exemplo em JSON
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

## Prévia da API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/links`
- `POST /api/links`
- `GET /api/links/:slug/analytics`
- `GET /r/:slug`

Veja [docs/api-endpoints.md](docs/api-endpoints.md).

## Dados de Demonstração

Os dados de exemplo em [data/seed.json](data/seed.json) incluem quatro links ativos ou pausados e 14 eventos de clique em campanhas de Workana, e-mail, WhatsApp e QR.

## Publicação

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
