const labels = {
  totalClicks: "Cliques totais",
  conversions: "Conversões",
  conversionRate: "Taxa de conversão",
  activeLinks: "Links ativos",
  riskFlags: "Alertas de risco"
};

async function api(path, options) {
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Falha na requisição");
  return payload;
}

function renderKpis(kpis) {
  document.querySelector("#kpis").innerHTML = Object.entries(labels).map(([key, label]) => {
    const value = key === "conversionRate" ? kpis[key] + "%" : kpis[key];
    return "<article class=\"kpi\"><span class=\"eyebrow\">" + label + "</span><strong>" + value + "</strong></article>";
  }).join("");
}

function renderLinks(links) {
  document.querySelector("#links").innerHTML = links.map((link) => {
    return [
      "<article class=\"link-row\" data-slug=\"" + link.slug + "\">",
      "<div><h3>" + link.title + "</h3><p>/" + link.slug + " - " + link.campaign + " - " + link.channel + "</p></div>",
      "<div class=\"metric\">" + link.totalClicks + "</div>",
      "</article>"
    ].join("");
  }).join("");
}

function renderQr(link) {
  document.querySelector("#qrTitle").textContent = "/" + link.slug;
  document.querySelector("#qr").innerHTML = link.qrMatrix.flatMap((row) => row).map((cell) => {
    return "<span class=\"" + (cell ? "on" : "") + "\"></span>";
  }).join("");
}

function renderChannels(channels) {
  document.querySelector("#channels").innerHTML = Object.entries(channels).map(([name, count]) => {
    return "<article class=\"channel\"><strong>" + name + "</strong><p>" + count + " cliques</p></article>";
  }).join("");
}

function renderRisks(risks) {
  document.querySelector("#risks").innerHTML = risks.length ? risks.map((link) => {
    return "<article class=\"risk\"><strong>" + link.title + "</strong><p>" + link.risk + " - " + link.conversionRate + "% de conversão</p></article>";
  }).join("") : "<p>Nenhum alerta de risco no conjunto atual de campanhas.</p>";
}

async function render() {
  const dashboard = await api("/api/dashboard");
  renderKpis(dashboard.kpis);
  renderLinks(dashboard.topLinks);
  renderQr(dashboard.topLinks[0]);
  renderChannels(dashboard.channelBreakdown);
  renderRisks(dashboard.riskFlags);
}

document.querySelector("#quickLink").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const slug = form.get("slug").toString();
  const destination = form.get("destination").toString();
  await api("/api/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug,
      destination,
      title: "Link rápido: " + slug,
      campaign: "Prospecção manual",
      channel: "direct"
    })
  });
  event.currentTarget.reset();
  await render();
});

render().catch((error) => {
  document.body.insertAdjacentHTML("beforeend", "<pre>" + error.message + "</pre>");
});
