const express = require("express");
const path = require("node:path");
const crypto = require("node:crypto");
const Database = require("./database");

function criarApp(opcoes = {}) {
  const app = express();
  const banco = opcoes.banco || new Database(opcoes.arquivoBanco);

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  function gerarCodigo() {
    return crypto.randomBytes(4).toString("base64url").slice(0, 6);
  }

  function urlValida(valor) {
    try {
      const url = new URL(valor);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }

  app.get("/api/links", (_req, res) => {
    res.json(banco.listar());
  });

  app.post("/api/links", (req, res) => {
    const urlOriginal = String(req.body.url || "").trim();
    const personalizado = String(req.body.codigo || "").trim().toLowerCase();

    if (!urlValida(urlOriginal)) {
      return res.status(400).json({ erro: "Informe uma URL válida iniciada por http:// ou https://." });
    }

    if (personalizado && !/^[a-z0-9_-]{3,24}$/.test(personalizado)) {
      return res.status(400).json({
        erro: "O código personalizado deve ter de 3 a 24 letras, números, hífens ou sublinhados.",
      });
    }

    let codigo = personalizado || gerarCodigo();
    while (!personalizado && banco.buscar(codigo)) codigo = gerarCodigo();

    if (banco.buscar(codigo)) {
      return res.status(409).json({ erro: "Este código já está sendo utilizado." });
    }

    const link = banco.criar({
      codigo,
      url: urlOriginal,
      acessos: 0,
      criadoEm: new Date().toISOString(),
      ultimoAcesso: null,
    });

    return res.status(201).json({
      ...link,
      urlCurta: `${req.protocol}://${req.get("host")}/${codigo}`,
    });
  });

  app.delete("/api/links/:codigo", (req, res) => {
    if (!banco.excluir(req.params.codigo)) {
      return res.status(404).json({ erro: "Link não encontrado." });
    }
    return res.status(204).send();
  });

  app.get("/:codigo", (req, res, next) => {
    if (req.params.codigo === "api") return next();
    const link = banco.incrementarAcesso(req.params.codigo);
    if (!link) return res.status(404).sendFile(path.join(__dirname, "..", "public", "404.html"));
    return res.redirect(302, link.url);
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
  });

  return app;
}

module.exports = criarApp;
