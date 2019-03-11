const Koa = require("koa");

const router = require("../../lib")();
const routes = require("./routes");

router.define(routes, { prefix: "/api" });

const app = new Koa();

app.use(router);

module.exports = app;
