const formulario = document.querySelector("#form-link");
const lista = document.querySelector("#lista");
const vazio = document.querySelector("#vazio");
const mensagem = document.querySelector("#mensagem");
const modelo = document.querySelector("#modelo-link");

document.querySelector("#prefixo").textContent = `${location.host}/`;

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo;
  setTimeout(() => {
    if (mensagem.textContent === texto) mensagem.className = "";
  }, 4500);
}

async function carregarLinks() {
  try {
    const resposta = await fetch("/api/links");
    const links = await resposta.json();
    lista.replaceChildren();
    vazio.classList.toggle("oculto", links.length > 0);
    document.querySelector("#resumo").textContent =
      `${links.length} ${links.length === 1 ? "link criado" : "links criados"}`;

    links.forEach(link => {
      const fragmento = modelo.content.cloneNode(true);
      const urlCurta = `${location.origin}/${link.codigo}`;
      const curto = fragmento.querySelector(".curto");
      curto.href = urlCurta;
      curto.textContent = urlCurta;
      fragmento.querySelector(".original").textContent = link.url;
      fragmento.querySelector(".acessos strong").textContent = link.acessos;
      fragmento.querySelector(".copiar").addEventListener("click", async evento => {
        await navigator.clipboard.writeText(urlCurta);
        evento.currentTarget.textContent = "Copiado!";
        setTimeout(() => evento.currentTarget.textContent = "Copiar", 1500);
      });
      fragmento.querySelector(".excluir").addEventListener("click", async () => {
        await fetch(`/api/links/${link.codigo}`, { method: "DELETE" });
        carregarLinks();
      });
      lista.appendChild(fragmento);
    });
  } catch {
    mostrarMensagem("Não foi possível carregar os links.", "erro");
  }
}

formulario.addEventListener("submit", async evento => {
  evento.preventDefault();
  const botao = formulario.querySelector("button");
  botao.disabled = true;
  botao.textContent = "Criando...";

  try {
    const resposta = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: document.querySelector("#url").value,
        codigo: document.querySelector("#codigo").value,
      }),
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.erro);
    mostrarMensagem(`Link criado: ${resultado.urlCurta}`, "sucesso");
    formulario.reset();
    carregarLinks();
  } catch (erro) {
    mostrarMensagem(erro.message || "Não foi possível criar o link.", "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Encurtar link";
  }
});

document.querySelector("#atualizar").addEventListener("click", carregarLinks);
carregarLinks();
