const Busboy = require("busboy");

function installMultipartHandler(ctx) {
  ctx.request.body = async fileProcessors => {
    const busboy = new Busboy({ headers: ctx.request.headers });

    const data = {};
    const promises = [];

    busboy.on("file", (name, stream, fileName, encoding, contentType) => {
      if (fileProcessors[name] == null) {
        busboy.emit("error", new Error(`No file processor for ${name}`));
      }

      promises.push(
        (async () => {
          data[name] = await fileProcessors[name]({
            stream,
            fileName,
            encoding,
            contentType
          });
        })()
      );
    });

    busboy.on("field", (name, value) => {
      data[name] = value;
    });

    ctx.req.pipe(busboy);

    await new Promise((resolve, reject) => {
      busboy.on("error", reject);
      busboy.on("finish", resolve);
    });

    await Promise.all(promises);

    ctx.request.body = data;
  };
}

module.exports = installMultipartHandler;
