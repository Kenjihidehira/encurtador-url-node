import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";
import { loadSeed, cloneData } from "./storage.js";
import { createLink, getDashboard, getLinkAnalytics, listLinks, recordClick } from "./linkService.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(rootDir, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendError(res, error) {
  sendJson(res, error.status || 500, { error: error.message || "Erro interno do servidor" });
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Body JSON inválido");
    error.status = 400;
    throw error;
  }
}

async function serveStatic(req, res) {
  const requested = new URL(req.url, "http://localhost").pathname;
  const cleanPath = requested === "/" ? "/index.html" : requested;
  const filePath = normalize(join(publicDir, cleanPath));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Proibido");
    return;
  }
  try {
    const file = await readFile(filePath);
    res.writeHead(200, { "content-type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    res.end(file);
  } catch {
    const fallback = await readFile(join(publicDir, "404.html"));
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(fallback);
  }
}

export async function createServer(seed) {
  const state = cloneData(seed || await loadSeed());

  return createHttpServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    try {
      if (url.pathname === "/api/health" && req.method === "GET") {
        return sendJson(res, 200, { ok: true, service: "linkpulse-campaign-links" });
      }

      if (url.pathname === "/api/dashboard" && req.method === "GET") {
        return sendJson(res, 200, getDashboard(state));
      }

      if (url.pathname === "/api/links" && req.method === "GET") {
        return sendJson(res, 200, { links: listLinks(state, Object.fromEntries(url.searchParams.entries())) });
      }

      if (url.pathname === "/api/links" && req.method === "POST") {
        return sendJson(res, 201, createLink(state, await parseBody(req)));
      }

      const analyticsMatch = url.pathname.match(/^\/api\/links\/([^/]+)\/analytics$/);
      if (analyticsMatch && req.method === "GET") {
        return sendJson(res, 200, getLinkAnalytics(state, analyticsMatch[1]));
      }

      const redirectMatch = url.pathname.match(/^\/r\/([^/]+)$/);
      if (redirectMatch && req.method === "GET") {
        const destination = recordClick(state, redirectMatch[1], {
          device: url.searchParams.get("device") || "desktop",
          country: url.searchParams.get("country") || "BR"
        });
        res.writeHead(302, { location: destination });
        res.end();
        return;
      }

      if (req.method === "GET") {
        return serveStatic(req, res);
      }

      sendJson(res, 404, { error: "Rota não encontrada" });
    } catch (error) {
      sendError(res, error);
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3000);
  const server = await createServer();
  server.listen(port, () => {
    console.log("LinkPulse Campaign Links rodando em http://localhost:" + port);
  });
}
