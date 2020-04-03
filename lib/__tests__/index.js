const createInternalRouter = require("find-my-way");

const createRouter = require("..");

jest.mock("ajv");
jest.mock("find-my-way");
jest.mock("fast-json-stringify");

describe("Router", () => {
  test("define single route without schema", () => {
    const dummyInternalRouter = {
      on: jest.fn()
    };

    createInternalRouter.mockReturnValue(dummyInternalRouter);

    const router = createRouter();

    const dummyRoute = {
      method: "GET",
      url: "/"
    };

    router.define(dummyRoute);

    expect(dummyInternalRouter.on.mock.calls.length).toBe(1);
    expect(dummyInternalRouter.on.mock.calls).toMatchSnapshot();
  });

  test("define single route with schema", () => {
    const dummyInternalRouter = {
      on: jest.fn()
    };

    createInternalRouter.mockReturnValue(dummyInternalRouter);

    const router = createRouter();

    const dummyRoute = {
      method: "GET",
      url: "/",
      schema: {
        request: {
          query: { type: "object" },
          params: { type: "object" },
          body: { type: "object" }
        },
        response: {
          200: { type: "object" }
        }
      }
    };

    router.define(dummyRoute);

    expect(dummyInternalRouter.on.mock.calls.length).toBe(1);
    expect(dummyInternalRouter.on.mock.calls[0]).toMatchSnapshot();
  });
});
