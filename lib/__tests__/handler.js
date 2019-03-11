const createHandler = require("../handler");

jest.mock("../postData");

describe("Handler", () => {
  test("no match", async () => {
    const dummyRouter = {
      find: jest.fn()
    };

    const handler = createHandler(dummyRouter);

    const dummyContext = {
      method: "GET",
      path: "/"
    };
    const next = jest.fn();

    await handler(dummyContext, next);

    expect(dummyRouter.find.mock.calls.length).toBe(1);
    expect(dummyRouter.find.mock.calls[0]).toEqual(["GET", "/"]);
    expect(next.mock.calls.length).toBe(1);
  });

  test("match with no schema", async () => {
    const dummyRoute = {
      store: {},
      handler: jest.fn(ctx => {
        ctx.body = { success: true };
      })
    };

    const dummyRouter = {
      find: jest.fn().mockReturnValue(dummyRoute)
    };

    const handler = createHandler(dummyRouter);

    const dummyContext = {
      method: "GET",
      path: "/",
      request: {}
    };
    const next = jest.fn();

    await handler(dummyContext, next);

    expect(dummyRouter.find.mock.calls.length).toBe(1);
    expect(dummyRouter.find.mock.calls[0]).toEqual(["GET", "/"]);
    expect(next.mock.calls.length).toBe(0);
    expect(dummyRoute.handler.mock.calls.length).toBe(1);
    expect(dummyRoute.handler.mock.calls[0][0]).toBe(dummyContext);
    expect(dummyContext.body).toEqual({ success: true });
  });

  test("match with schema and valid input", async () => {
    const dummyRoute = {
      store: {
        validators: {
          params: jest.fn().mockReturnValue(true),
          query: jest.fn().mockReturnValue(true)
        },
        serializers: {
          get: jest.fn().mockReturnValue(x => JSON.stringify(x))
        }
      },
      handler: jest.fn(ctx => {
        ctx.body = { success: true };
      })
    };

    const dummyRouter = {
      find: jest.fn().mockReturnValue(dummyRoute)
    };

    const handler = createHandler(dummyRouter);

    const dummyContext = {
      method: "GET",
      path: "/",
      request: {},
      status: 200
    };
    const next = jest.fn();

    await handler(dummyContext, next);

    expect(dummyRouter.find.mock.calls.length).toBe(1);
    expect(dummyRouter.find.mock.calls[0]).toEqual(["GET", "/"]);
    expect(next.mock.calls.length).toBe(0);
    expect(dummyRoute.handler.mock.calls.length).toBe(1);
    expect(dummyRoute.handler.mock.calls[0][0]).toBe(dummyContext);
    expect(dummyRoute.store.serializers.get.mock.calls[0][0]).toBe(
      dummyContext.status
    );
    expect(dummyContext.body).toBe('{"success":true}');
  });

  test("match with schema and invalid params", async () => {
    const dummyRoute = {
      store: {
        validators: {
          params: jest.fn().mockReturnValue(false)
        }
      }
    };

    const dummyRouter = {
      find: jest.fn().mockReturnValue(dummyRoute)
    };

    const handler = createHandler(dummyRouter);

    const dummyContext = {
      method: "GET",
      path: "/",
      request: {},
      status: 200
    };
    const next = jest.fn();

    try {
      await handler(dummyContext, next);

      throw new Error("Should have gone into catch block");
    } catch (err) {
      expect(err.status).toBe(422);
    }

    expect(next.mock.calls.length).toBe(0);
  });

  test("match with schema and invalid query", async () => {
    const dummyRoute = {
      store: {
        validators: {
          query: jest.fn().mockReturnValue(false)
        }
      }
    };

    const dummyRouter = {
      find: jest.fn().mockReturnValue(dummyRoute)
    };

    const handler = createHandler(dummyRouter);

    const dummyContext = {
      method: "GET",
      path: "/",
      request: {},
      status: 200
    };
    const next = jest.fn();

    try {
      await handler(dummyContext, next);

      throw new Error("Should have gone into catch block");
    } catch (err) {
      expect(err.status).toBe(422);
    }

    expect(next.mock.calls.length).toBe(0);
  });

  test("match with schema and missing serializer", async () => {
    const dummyRoute = {
      store: {
        serializers: {
          get: jest.fn()
        }
      },
      handler: jest.fn(ctx => {
        ctx.body = { success: true };
      })
    };

    const dummyRouter = {
      find: jest.fn().mockReturnValue(dummyRoute)
    };

    const handler = createHandler(dummyRouter);

    const dummyContext = {
      method: "GET",
      path: "/",
      request: {},
      status: 200
    };
    const next = jest.fn();

    await handler(dummyContext, next);

    expect(next.mock.calls.length).toBe(0);
    expect(typeof dummyContext.body).toBe("object");
    expect(dummyContext.body).toEqual({ success: true });
  });
});
