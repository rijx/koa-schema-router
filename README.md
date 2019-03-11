# koa-schema-router

![build status](https://gitlab.com/rijx/koa-schema-router/badges/master/build.svg?style=flat) ![test coverage](https://gitlab.com/rijx/koa-schema-router/badges/master/coverage.svg?style=flat) ![npm version](https://img.shields.io/npm/v/koa-schema-router.svg)

JSON schema based router for Koa. Includes request parsing, validation and response serialization.

## Example

```js
const createSchemaRouter = require("koa-schema-router");
const Koa = require("koa");

const api = createSchemaRouter();

api.define({
  method: "POST",
  url: "/test",
  schema: {
    request: {
      consumes: ["application/json"],
      body: {
        type: "object",
        properties: {
          test: { type: "string" }
        }
      }
    },
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" }
        }
      }
    }
  },
  handler(ctx) {
    ctx.body = { hello: "world" };
  }
});

const app = new Koa();

app.use(api);

app.listen(8080);
```
