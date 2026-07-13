import test from "node:test";
import assert from "node:assert/strict";
import { loadSeed } from "../src/storage.js";
import { createLink, getDashboard, getLinkAnalytics, recordClick } from "../src/linkService.js";
import { createServer } from "../src/server.js";

test("dashboard summarizes clicks and conversion", async () => {
  const data = await loadSeed();
  const dashboard = getDashboard(data);

  assert.equal(dashboard.kpis.totalClicks, 14);
  assert.equal(dashboard.kpis.conversionRate, 43);
  assert.equal(dashboard.topLinks[0].totalClicks, 4);
});

test("analytics includes QR matrix and device split", async () => {
  const data = await loadSeed();
  const analytics = getLinkAnalytics(data, "workana-crm");

  assert.equal(analytics.shortUrl, "https://links.example.test/r/workana-crm");
  assert.equal(analytics.qrMatrix.length, 7);
  assert.equal(analytics.devices.desktop, 2);
});

test("createLink validates destination and slug uniqueness", async () => {
  const data = await loadSeed();
  const created = createLink(data, {
    slug: "new-offer",
    destination: "https://example.com/new-offer",
    title: "New Offer",
    campaign: "Outbound",
    channel: "email"
  });

  assert.equal(created.status, "active");
  assert.equal(data.links.length, 5);
  assert.throws(() => createLink(data, {
    slug: "new-offer",
    destination: "https://example.com/duplicate",
    title: "Duplicate",
    campaign: "Outbound",
    channel: "email"
  }), /slug já existe/);
});

test("redirect endpoint records clicks", async () => {
  const data = await loadSeed();
  const before = data.events.length;
  const destination = recordClick(data, "email-demo", { device: "mobile", country: "BR" });

  assert.equal(destination, "https://example.com/email-demo");
  assert.equal(data.events.length, before + 1);
});

test("api responds with dashboard payload", async () => {
  const server = await createServer(await loadSeed());
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = "http://127.0.0.1:" + server.address().port;
  try {
    const response = await fetch(baseUrl + "/api/dashboard");
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.kpis.activeLinks, 3);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
