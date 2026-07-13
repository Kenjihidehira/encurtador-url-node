const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function buildQrMatrix(slug) {
  const source = Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => ((source + row * 7 + col * 11 + row * col) % 3) !== 0)
  );
}

export function validateLinkInput(data, input) {
  const required = ["slug", "destination", "title", "campaign", "channel"];
  const missing = required.filter((field) => !input[field]);
  if (missing.length) {
    const error = new Error("Campos obrigatórios ausentes: " + missing.join(", "));
    error.status = 422;
    throw error;
  }
  if (!slugPattern.test(input.slug)) {
    const error = new Error("slug deve estar em kebab-case minúsculo");
    error.status = 422;
    throw error;
  }
  try {
    const url = new URL(input.destination);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
  } catch {
    const error = new Error("destination deve ser uma URL http ou https válida");
    error.status = 422;
    throw error;
  }
  if (data.links.some((link) => link.slug === input.slug)) {
    const error = new Error("slug já existe");
    error.status = 409;
    throw error;
  }
}

export function getLinkAnalytics(data, slug) {
  const link = data.links.find((item) => item.slug === slug);
  if (!link) {
    const error = new Error("Link não encontrado");
    error.status = 404;
    throw error;
  }

  const events = data.events.filter((event) => event.slug === slug);
  const conversions = events.filter((event) => event.converted).length;
  const conversionRate = events.length ? Math.round((conversions / events.length) * 100) : 0;

  return {
    ...link,
    shortUrl: data.meta.baseUrl + "/r/" + link.slug,
    totalClicks: events.length,
    conversions,
    conversionRate,
    devices: countBy(events, "device"),
    countries: countBy(events, "country"),
    qrMatrix: buildQrMatrix(link.slug),
    risk: link.status !== "active" ? "Link pausado" : conversionRate < 25 && events.length > 2 ? "Baixa conversão" : null
  };
}

export function listLinks(data, filters = {}) {
  return data.links
    .filter((link) => !filters.campaign || link.campaign === filters.campaign)
    .filter((link) => !filters.channel || link.channel === filters.channel)
    .filter((link) => !filters.status || link.status === filters.status)
    .map((link) => getLinkAnalytics(data, link.slug))
    .sort((a, b) => b.totalClicks - a.totalClicks);
}

export function getDashboard(data) {
  const links = listLinks(data);
  const totalClicks = data.events.length;
  const conversions = data.events.filter((event) => event.converted).length;
  const conversionRate = totalClicks ? Math.round((conversions / totalClicks) * 100) : 0;
  const riskFlags = links.filter((link) => link.risk);

  return {
    generatedAt: data.meta.generatedAt,
    kpis: {
      totalClicks,
      conversions,
      conversionRate,
      activeLinks: links.filter((link) => link.status === "active").length,
      riskFlags: riskFlags.length
    },
    topLinks: links.slice(0, 5),
    channelBreakdown: countBy(data.events.map((event) => {
      const link = data.links.find((item) => item.slug === event.slug);
      return { channel: link?.channel || "desconhecido" };
    }), "channel"),
    riskFlags
  };
}

export function createLink(data, input) {
  validateLinkInput(data, input);
  const link = {
    slug: input.slug,
    destination: input.destination,
    title: input.title,
    campaign: input.campaign,
    channel: input.channel,
    utmSource: input.utmSource || input.channel,
    utmMedium: input.utmMedium || "link",
    createdAt: data.meta.generatedAt,
    status: input.status || "active"
  };
  data.links.push(link);
  return getLinkAnalytics(data, link.slug);
}

export function recordClick(data, slug, meta = {}) {
  const link = data.links.find((item) => item.slug === slug);
  if (!link) {
    const error = new Error("Link não encontrado");
    error.status = 404;
    throw error;
  }
  data.events.push({
    slug,
    device: meta.device || "desktop",
    country: meta.country || "BR",
    converted: Boolean(meta.converted),
    createdAt: new Date().toISOString()
  });
  return link.destination;
}
