const parseBody = require("co-body");

const processPostData = require("..");
const installMultipartHandler = require("../multipart");

jest.mock("co-body");
jest.mock("../multipart");

describe("Post data", () => {
  test("no matched route", async () => {
    const dummyContext = {};

    await processPostData(dummyContext);
  });

  test("matched route with valid input", async () => {
    parseBody.mockReturnValue({ success: true });

    const dummyRoute = {
      store: {
        schema: {
          request: {
            body: {}
          }
        },
        validators: {
          body: jest.fn().mockReturnValue(true)
        }
      }
    };

    const dummyContext = {
      _matchedRoute: dummyRoute,
      request: {
        headers: {
          "content-type": "application/json"
        }
      }
    };

    await processPostData(dummyContext);

    expect(dummyContext.request.body).toEqual({ success: true });
  });

  test("matched route with invalid input", async () => {
    parseBody.mockReturnValue({ success: true });

    const dummyRoute = {
      store: {
        schema: {
          request: {
            body: {}
          }
        },
        validators: {
          body: jest.fn().mockReturnValue(false)
        }
      }
    };

    const dummyContext = {
      _matchedRoute: dummyRoute,
      request: {
        headers: {
          "content-type": "application/json"
        }
      }
    };

    try {
      await processPostData(dummyContext);

      throw new Error("Should have gone into catch block");
    } catch (err) {
      expect(err.status).toBe(422);
    }
  });

  test("matched route with unknown content type", async () => {
    parseBody.mockReturnValue({ success: true });

    const dummyRoute = {
      store: {
        schema: {
          request: {
            body: {}
          }
        }
      }
    };

    const dummyContext = {
      _matchedRoute: dummyRoute,
      request: {
        headers: {
          "content-type": "magic"
        }
      }
    };

    try {
      await processPostData(dummyContext);

      throw new Error("Should have gone into catch block");
    } catch (err) {
      expect(err.status).toBe(415);
    }
  });

  test("matched route with multipart form data", async () => {
    const dummyRoute = {
      store: {
        schema: {
          request: {
            consumes: ["multipart/form-data"],
            body: {}
          }
        }
      }
    };

    const dummyContext = {
      _matchedRoute: dummyRoute,
      request: {
        headers: {
          "content-type": "multipart/form-data"
        }
      }
    };

    await processPostData(dummyContext);

    expect(installMultipartHandler.mock.calls.length).toBe(1);
  });
});
