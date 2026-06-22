const criarApp = require("./app");

const PORTA = process.env.PORT || 3000;
const app = criarApp();

app.listen(PORTA, () => {
  console.log(`Encurtador disponível em http://localhost:${PORTA}`);
});
