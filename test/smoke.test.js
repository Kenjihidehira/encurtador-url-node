import assert from "node:assert/strict";
import { createServer } from "../src/server.js";
import { loadSeed } from "../src/storage.js";

const server = await createServer(await loadSeed());
await new Promise((resolve) => server.listen(0, resolve));
const baseUrl = "http://127.0.0.1:" + server.address().port;

try {
  const html = await fetch(baseUrl + "/").then((response) => response.text());
  const css = await fetch(baseUrl + "/style.css").then((response) => response.text());
  const dashboard = await fetch(baseUrl + "/api/dashboard").then((response) => response.json());
  const redirect = await fetch(baseUrl + "/r/workana-crm", { redirect: "manual" });

  assert.match(html, /Transforme propostas/);
  assert.match(css, /qr/);
  assert.equal(dashboard.kpis.totalClicks, 14);
  assert.equal(redirect.status, 302);
  console.log("smoke ok");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
