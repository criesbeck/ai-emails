import { render } from "@testing-library/react";
import App from "./App";
import axios from "axios";
import AxiosMock from "axios-mock-adapter";

const mock = new AxiosMock(axios);
mock.onGet().reply(200, { submissions: {}, authors: {} });

describe("Smoke tests", () => {
  test("Our application renders without crashing", () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
