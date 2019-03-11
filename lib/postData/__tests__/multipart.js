const Busboy = require("busboy");
const { EventEmitter } = require("events");

const installMultipartHandler = require("../multipart");

jest.mock("busboy");

describe("Multipart", () => {
  test("basic use", async () => {
    const dummyBusboy = new EventEmitter();

    Busboy.mockImplementation(() => dummyBusboy);

    const dummyContext = {
      req: {
        pipe: jest.fn()
      },
      request: {
        headers: {}
      }
    };

    installMultipartHandler(dummyContext);

    setImmediate(() => {
      dummyBusboy.emit(
        "file",
        "test",
        "[Stream]",
        "test.png",
        "base64",
        "type/png"
      );
      dummyBusboy.emit("field", "hello", "world");
      dummyBusboy.emit("finish");
    });

    const dummyProcessors = {
      test: jest.fn()
    };

    await dummyContext.request.body(dummyProcessors);

    expect(dummyProcessors.test.mock.calls.length).toBe(1);

    expect({
      dummyProcessor: dummyProcessors.test.mock.calls[0],
      body: dummyContext.request.body
    }).toMatchSnapshot();
  });

  test("missing processor", async () => {
    const dummyBusboy = new EventEmitter();

    Busboy.mockImplementation(() => dummyBusboy);

    const dummyContext = {
      req: {
        pipe: jest.fn()
      },
      request: {
        headers: {}
      }
    };

    installMultipartHandler(dummyContext);

    setImmediate(() => {
      dummyBusboy.emit(
        "file",
        "test",
        "[Stream]",
        "test.png",
        "base64",
        "type/png"
      );
      dummyBusboy.emit("field", "hello", "world");
      dummyBusboy.emit("finish");
    });

    const dummyProcessors = {};

    try {
      await dummyContext.request.body(dummyProcessors);

      throw new Error("Should have gone into catch block");
    } catch (err) {
      expect(err).toMatchSnapshot();
    }
  });
});
