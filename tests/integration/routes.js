module.exports = [
  {
    method: "GET",
    url: "/test",
    handler(ctx) {
      ctx.body = "it works";
    }
  },
  {
    method: "GET",
    url: "/test/:num",
    schema: {
      request: {
        params: {
          type: "object",
          properties: {
            num: { type: "number" }
          }
        }
      }
    },
    handler(ctx) {
      if (typeof ctx.params.num != "number") {
        ctx.throw(400);
      }

      ctx.body = `The number is ${ctx.params.num}`;
    }
  }
];
