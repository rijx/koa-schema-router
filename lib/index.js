const Ajv = require("ajv");
const createInternalRouter = require("find-my-way");
const fastJson = require("fast-json-stringify");

const ajv = new Ajv({ coerceTypes: true, removeAdditional: true });
const createHandler = require("./handler");

function prefix(path) {
  const obj = Object.create(this);

  obj.define = route => {
    this.define({
      ...route,
      url: `${path}${route.url || ""}`
    });
  };

  return obj;
}

function createRouter() {
  const internalRouter = createInternalRouter();

  const router = createHandler(internalRouter);

  router.internalRouter = internalRouter;
  router.define = define;
  router.prefix = prefix;

  return router;
}

function define(route) {
  if (Array.isArray(route)) {
    return route.map(x => this.define(x));
  }

  const { schema } = route;
  const validators = {
    query:
      schema &&
      schema.request &&
      schema.request.query &&
      ajv.compile(schema.request.query),
    params:
      schema &&
      schema.request &&
      schema.request.params &&
      ajv.compile(schema.request.params),
    body:
      schema &&
      schema.request &&
      schema.request.body &&
      ajv.compile(schema.request.body)
  };
  const serializers = new Map();

  if (schema != null) {
    for (const httpCode in schema.response) {
      serializers.set(httpCode, fastJson(schema.response[httpCode]));
    }
  }

  this.internalRouter.on(route.method, route.url, route.handler, {
    schema,
    serializers,
    validators
  });
}

module.exports = createRouter;
