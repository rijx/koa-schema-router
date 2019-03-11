const http = require("http");

const app = require("./app");
const runTests = require("./tests");

setImmediate(async () => {
  try {
    const server = http.createServer(app.callback());

    await new Promise((resolve, reject) => {
      server.on("error", reject);
      server.listen(resolve);
    });

    await runTests(`http://localhost:${server.address().port}`);

    process.exit();
  } catch (err) {
    process.stderr.write(err.stack || err.message);

    process.exit(1);
  }
});
