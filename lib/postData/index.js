const contentType = require("content-type");
const httpError = require("http-errors");
const parseBody = require("co-body");

const installMultipartHandler = require("./multipart");

function parseContentTypeSafely(str) {
  try {
    return contentType.parse(str);
  } catch (err) {
    return {};
  }
}

async function processPostData(ctx) {
  const route = ctx._matchedRoute;

  if (
    route == null ||
    route.store == null ||
    route.store.schema == null ||
    route.store.schema.request == null ||
    route.store.schema.request.body == null
  ) {
    return;
  }

  const consumedTypes = route.store.schema.request.consumes || [
    "application/json"
  ];

  const { type } = parseContentTypeSafely(ctx.request.headers["content-type"]);

  if (type == null || !consumedTypes.includes(type)) {
    throw httpError.UnsupportedMediaType();
  }

  if (type == "multipart/form-data") {
    installMultipartHandler(ctx);
  } else {
    ctx.request.body = await parseBody(ctx);

    if (
      route.store.validators &&
      route.store.validators.body &&
      !route.store.validators.body(ctx.request.body)
    ) {
      throw httpError.UnprocessableEntity();
    }
  }
}

module.exports = processPostData;
