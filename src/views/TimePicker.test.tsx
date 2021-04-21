import { render } from "@testing-library/react";
import TimePicker from "./TimePicker";

global.window = Object.create(window);
Object.defineProperty(window, "location", {
  value: {
    href: "/",
  },
  writable: true,
});

beforeEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { assign: jest.fn() },
  });
  window.location.pathname = "/";
});

describe("Our time picker", () => {
  test("Renders at /", () => {
    const { queryByTestId } = render(
      <TimePicker currentTime={3} setCurrentTime={() => {}} />
    );
    expect(queryByTestId("time-picker")).toBeInTheDocument();
  });
  test("Does not render at /12345", () => {
    window.location.pathname = "/12345";
    const { queryByTestId } = render(
      <TimePicker currentTime={3} setCurrentTime={() => {}} />
    );
    expect(queryByTestId("time-picker")).not.toBeInTheDocument();
  });
});
