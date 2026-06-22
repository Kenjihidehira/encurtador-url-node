# Encurta — Encurtador de URLs

Aplicação web e API para transformar endereços longos em links curtos.

## Funcionalidades

- Criar links curtos aleatórios
- Definir códigos personalizados
- Redirecionar para a URL original
- Contabilizar acessos
- Copiar e excluir links
- Persistir os dados em arquivo JSON
- Validar URLs e códigos
- Testes automatizados

## Instalação

```bash
npm install
npm start
```

Acesse `http://localhost:3000`.

## API

| Método | Rota | Ação |
| --- | --- | --- |
| GET | `/api/links` | Listar links |
| POST | `/api/links` | Criar link |
| DELETE | `/api/links/:codigo` | Excluir link |
| GET | `/:codigo` | Redirecionar e contabilizar acesso |

## Testes

```bash
npm test
```
