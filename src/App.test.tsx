import { render } from "@testing-library/react";
import App, { Providers } from "./App";
import axios from "axios";
import AxiosMock from "axios-mock-adapter";

const mock = new AxiosMock(axios);
mock.onGet().reply(200, { submissions: {}, authors: {} });

describe("Smoke tests", () => {
  test("Providers render their children", () => {
    const { getByTestId } = render(
      <Providers>
        <h1 data-testid="hello">Hello!</h1>
      </Providers>
    );
    expect(getByTestId("hello")).toBeInTheDocument();
  });
  test("Our application renders without crashing", () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
