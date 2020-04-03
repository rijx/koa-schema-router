const Ajv = require("ajv");
const compose = require("koa-compose");
const convertSchema = require("openapi-schema-to-json-schema");
const createInternalRouter = require("find-my-way");
const fastJson = require("fast-json-stringify");
const traverseSchema = require("json-schema-traverse");

const { applyRoute, executeRoute } = require("./handler");

const ajv = new Ajv({
  coerceTypes: true,
  removeAdditional: true
});

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
  const internalRouter = createInternalRouter({
    maxParamLength: 500
  });

  const router = {};

  router.handler = router;
  router.internalRouter = internalRouter;
  router.define = define;
  router.stack = [];
  router.use = use;
  router.routes = routes;
  router.prefix = prefix;

  return router;
}

function routes() {
  const middlewareStack = compose(this.stack);

  return async (ctx, next) => {
    const route = this.internalRouter.find(ctx.method, ctx.path);

    if (route == null) {
      return next();
    }

    applyRoute(ctx, route);

    await middlewareStack(ctx, async () => {
      await executeRoute(ctx);
    });
  };
}

function use(middleware) {
  this.stack.push(middleware);
}

function getConsumes(schema) {
  return (schema && schema.consumes) || ["application/json"];
}

const JSON_SCHEMA_STRING_FORMATS = [
  "date-time",
  "time",
  "date",
  "email",
  "idn-email",
  "hostname",
  "idn-hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "iri",
  "iri-reference"
];

function convertOpenAPISchema(schema) {
  const newSchema = convertSchema(schema);

  delete newSchema.$schema;

  traverseSchema(newSchema, {
    cb(obj) {
      if (obj.type == "object" && obj.additionalProperties == null) {
        obj.additionalProperties = false;
      }

      /*if (obj.nullable) {
        obj.type = [].concat(obj.type).concat("null");
      }*/

      if (
        obj.type == "string" &&
        !JSON_SCHEMA_STRING_FORMATS.includes(obj.format)
      ) {
        delete obj.format;
      }
    }
  });

  return newSchema;
}

function define(route) {
  function ajvCompileTracefully(schema, name) {
    try {
      return ajv.compile(schema);
    } catch (err) {
      throw new Error(
        `Could not compile schema for ${route.schema.tags[0]} > ${
          route.schema.operationId
        } > ${name}: ${err.message}`
      );
    }
  }

  const { schema } = route;
  const validators = {
    query:
      schema && schema.request && schema.request.query
        ? ajvCompileTracefully(
            convertOpenAPISchema(schema.request.query),
            "query"
          )
        : null,
    params:
      schema && schema.request && schema.request.params
        ? ajvCompileTracefully(
            convertOpenAPISchema(schema.request.params),
            "params"
          )
        : null,
    body:
      schema &&
      // getConsumes(schema).includes("application/json") &&
      schema.request &&
      schema.request.body
        ? ajvCompileTracefully(
            convertOpenAPISchema(schema.request.body),
            "body"
          )
        : null
  };
  const serializers = new Map();

  if (schema != null) {
    for (const httpCode in schema.response) {
      const response = schema.response[httpCode];

      if (response == null) {
        continue;
      }

      const serializerSchema =
        response.schema != null ? response.schema : response;

      // TODO: create headers validator
      if (serializerSchema.type != "string") {
        const fn = fastJson(serializerSchema);
        fn.schema = serializerSchema;
        serializers.set(Number(httpCode), { body: fn });
      }
    }
  }

  this.internalRouter.on(route.method, route.url || "/", route.handler, {
    schema,
    serializers,
    validators
  });
}

module.exports = createRouter;
