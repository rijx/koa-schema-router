const httpError = require("http-errors");

const processPostData = require("./postData");

function createApiMiddleware(router) {
  return async (ctx, next) => {
    const route = router.find(ctx.method, ctx.path);

    if (route == null) {
      return next();
    }

    ctx.request.params = route.params;
    ctx.params = route.params;
    ctx._matchedRoute = route;

    if (route.store.validators != null) {
      if (
        route.store.validators.params &&
        !route.store.validators.params(ctx.request.params)
      ) {
        throw httpError.UnprocessableEntity();
      }

      if (
        route.store.validators.query &&
        !route.store.validators.query(ctx.request.query)
      ) {
        throw httpError.UnprocessableEntity();
      }

      await processPostData(ctx);
    }

    await route.handler.call(ctx, ctx);

    if (route.store.serializers != null) {
      const serializer = route.store.serializers.get(ctx.status);

      if (serializer != null) {
        ctx.body = serializer(ctx.body);
      }
    }
  };
}

module.exports = createApiMiddleware;
