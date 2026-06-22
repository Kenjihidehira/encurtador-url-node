const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const criarApp = require("../src/app");

let servidor;
let baseUrl;
let diretorio;

test.before(async () => {
  diretorio = fs.mkdtempSync(path.join(os.tmpdir(), "encurta-"));
  const app = criarApp({ arquivoBanco: path.join(diretorio, "links.json") });
  await new Promise(resolve => {
    servidor = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${servidor.address().port}`;
      resolve();
    });
  });
});

test.after(() => {
  servidor.close();
  fs.rmSync(diretorio, { recursive: true, force: true });
});

test("cria e lista um link", async () => {
  const criacao = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://example.com/pagina", codigo: "exemplo" }),
  });
  const link = await criacao.json();
  assert.equal(criacao.status, 201);
  assert.equal(link.codigo, "exemplo");

  const listagem = await fetch(`${baseUrl}/api/links`);
  const links = await listagem.json();
  assert.equal(links.length, 1);
});

test("redireciona e contabiliza acesso", async () => {
  const resposta = await fetch(`${baseUrl}/exemplo`, { redirect: "manual" });
  assert.equal(resposta.status, 302);
  assert.equal(resposta.headers.get("location"), "https://example.com/pagina");

  const links = await (await fetch(`${baseUrl}/api/links`)).json();
  assert.equal(links[0].acessos, 1);
});

test("rejeita URL inválida e código duplicado", async () => {
  const invalida = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "não é url" }),
  });
  assert.equal(invalida.status, 400);

  const duplicado = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://openai.com", codigo: "exemplo" }),
  });
  assert.equal(duplicado.status, 409);
});

test("exclui um link", async () => {
  const resposta = await fetch(`${baseUrl}/api/links/exemplo`, { method: "DELETE" });
  assert.equal(resposta.status, 204);
  const links = await (await fetch(`${baseUrl}/api/links`)).json();
  assert.equal(links.length, 0);
});
