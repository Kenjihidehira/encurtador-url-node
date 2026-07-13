# Endpoints da API

URL base:

```text
http://localhost:3000
```

## GET /api/health

Retorna o status do serviço.

## GET /api/dashboard

Retorna KPIs de campanha, principais links, divisão por canal e alertas de risco.

## GET /api/links

Filtros opcionais:

- `campaign=Freelance Pipeline`
- `channel=email`
- `status=active`

## POST /api/links

```json
{
  "slug": "proposta-cliente",
  "destination": "https://example.com/proposta",
  "title": "Proposta para cliente",
  "campaign": "Prospecção Workana",
  "channel": "workana",
  "utmSource": "workana",
  "utmMedium": "proposal"
}
```

Validação:

- `slug` deve estar em kebab-case minúsculo.
- `destination` deve ser uma URL `http` ou `https` válida.
- `campaign` e `channel` são obrigatórios.

## GET /api/links/:slug/analytics

Retorna um link com totais de clique, taxa de conversão, divisão por dispositivo, canal e matriz QR.

## GET /r/:slug

Registra um clique de demonstração e redireciona para a URL de destino.
