const Busboy = require("busboy");
const cloneDeep = require("lodash/cloneDeep");
const fs = require("mz/fs");
const get = require("lodash/get");
const meter = require("stream-meter");
const multipipe = require("multipipe");
const nanoid = require("nanoid/async");
const { tmpdir } = require("os");
const { promisify } = require("util");
const set = require("lodash/set");
const unset = require("lodash/unset");

const multipipeAsync = promisify(multipipe);

const NUMBER_REGEX = /^[0-9+]$/;

function applyRoute(ctx, route) {
  ctx.request.params = route.params;
  ctx.params = route.params;
  ctx._matchedRoute = route;
}

function parseQueryKey(key) {
  return key.replace(/\[([^\]]+)\]/g, ".$1").split(/\./g);
}

function describeAjvError(validator) {
  return validator.errors.map(x => `${x.dataPath} ${x.message}`).join("\r\n");
}

async function executeRoute(ctx) {
  const route = ctx._matchedRoute;

  if (route.store.validators != null) {
    if (
      route.store.validators.params != null &&
      !route.store.validators.params(ctx.request.params)
    ) {
      ctx.throw(400, describeAjvError(route.store.validators.params));
    }

    if (
      route.store.validators.query != null &&
      !route.store.validators.query(ctx.request.query)
    ) {
      ctx.throw(400, describeAjvError(route.store.validators.query));
    }

    if (route.store.validators.body != null) {
      if (
        ctx.request.headers["content-type"].startsWith("multipart/form-data;")
      ) {
        const files = [];

        const busboy = new Busboy({
          headers: ctx.request.headers
        });

        const filteredSchema = cloneDeep(route.store.validators.body.schema);

        busboy.on("file", (name, stream, fileName, encoding, mimeType) => {
          const parsedQueryKey = parseQueryKey(name);

          const schemaQueryKey = parsedQueryKey.reduce((total, element) => {
            return NUMBER_REGEX.exec(element)
              ? total.concat("items")
              : total.concat("properties").concat(element);
          }, []);

          const schema = get(
            route.store.validators.body.schema,
            schemaQueryKey
          );

          if (schema == null) {
            busboy.emit(
              "error",
              new Error(`No schema defined for ${parsedQueryKey.join(".")}`)
            );

            return;
          }

          unset(filteredSchema, schemaQueryKey);

          // TODO: check if .format == "binary"?

          files.push(
            (async () => {
              const tempDirPath = await fs.realpath(tmpdir());

              const id = await nanoid();

              const tempFilePath = `${tempDirPath}/${id}-${fileName}`;

              const tempFileStream = fs.createWriteStream(tempFilePath);

              if (schema.maxLength != null) {
                await multipipeAsync(
                  stream,
                  meter(schema.maxLength),
                  tempFileStream
                );
              } else {
                await multipipeAsync(stream, tempFileStream);
              }

              const readStream = fs.createReadStream(tempFilePath);

              readStream.fileName = fileName;
              readStream.mimeType = mimeType;

              return {
                key: parsedQueryKey,
                value: readStream
              };
            })()
          );
        });

        busboy.on("field", (name, value) => {
          set(ctx.request.body, parseQueryKey(name), value);
        });

        ctx.req.pipe(busboy);

        await new Promise((resolve, reject) => {
          busboy.on("error", reject);
          busboy.on("finish", resolve);
        });

        const processedFiles = await Promise.all(files);

        if (!route.store.validators.body(ctx.request.body)) {
          ctx.throw(400, describeAjvError(route.store.validators.body));
        }

        for (const processedFile of processedFiles) {
          set(ctx.request.body, processedFile.key, processedFile.value);
        }
      } else {
        if (!route.store.validators.body(ctx.request.body)) {
          ctx.throw(400, describeAjvError(route.store.validators.body));
        }
      }
    }
  }

  await route.handler.call(ctx, ctx);

  if (route.store.serializers != null) {
    const serializer = route.store.serializers.get(Number(ctx.status));

    if (serializer != null) {
      ctx.type = "application/json";

      if (serializer.headers != null) {
        const headers = serializer.headers(ctx.res.getHeaders());

        for (const headerName in headers) {
          ctx.set(headerName, headers[headerName]);
        }
      }

      if (serializer.body != null) {
        ctx.body = serializer.body(ctx.body);
      }
    }
  }
}

module.exports = {
  applyRoute,
  executeRoute
};
