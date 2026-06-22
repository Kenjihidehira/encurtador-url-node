const fs = require("node:fs");
const path = require("node:path");

class Database {
  constructor(arquivo = path.join(__dirname, "..", "data", "links.json")) {
    this.arquivo = arquivo;
    this.garantirArquivo();
  }

  garantirArquivo() {
    fs.mkdirSync(path.dirname(this.arquivo), { recursive: true });
    if (!fs.existsSync(this.arquivo)) fs.writeFileSync(this.arquivo, "[]");
  }

  listar() {
    try {
      return JSON.parse(fs.readFileSync(this.arquivo, "utf8"));
    } catch {
      return [];
    }
  }

  salvar(links) {
    fs.writeFileSync(this.arquivo, JSON.stringify(links, null, 2));
  }

  buscar(codigo) {
    return this.listar().find(link => link.codigo === codigo);
  }

  criar(link) {
    const links = this.listar();
    links.unshift(link);
    this.salvar(links);
    return link;
  }

  incrementarAcesso(codigo) {
    const links = this.listar();
    const link = links.find(item => item.codigo === codigo);
    if (!link) return null;
    link.acessos++;
    link.ultimoAcesso = new Date().toISOString();
    this.salvar(links);
    return link;
  }

  excluir(codigo) {
    const links = this.listar();
    const restantes = links.filter(link => link.codigo !== codigo);
    if (restantes.length === links.length) return false;
    this.salvar(restantes);
    return true;
  }
}

module.exports = Database;
