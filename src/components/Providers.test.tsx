import { render } from "@testing-library/react";
import Providers from "./Providers";

describe("Our providers", () => {
  test("Providers render their children", () => {
    const { getByTestId } = render(
      <Providers>
        <h1 data-testid="hello">Hello!</h1>
      </Providers>
    );
    expect(getByTestId("hello")).toBeInTheDocument();
  });
});
