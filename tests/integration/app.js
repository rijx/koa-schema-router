const Koa = require("koa");

const router = require("../../lib")();
const routes = require("./routes");

const api = router.prefix("/api");

for (const route of routes) {
  api.define(route);
}

const app = new Koa();

app.use(router.routes());

module.exports = app;
