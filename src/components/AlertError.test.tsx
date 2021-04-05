import { render } from "@testing-library/react";
import AlertError from "./AlertError";

describe("Our alert error", () => {
  test("When show is true, renders an error", () => {
    const { getByText } = render(
      <AlertError show message="This is in the document!" />
    );
    expect(getByText("This is in the document!")).toBeInTheDocument();
  });
  test("When show is false, renders nothing", () => {
    const { queryByText } = render(
      <AlertError show={false} message="This is in the document!" />
    );
    expect(queryByText("This is in the document!")).not.toBeInTheDocument();
  });
  test("Handles test ids correctly", () => {
    const { getByTestId } = render(
      <AlertError
        show
        data-testid="testing-error"
        message="This is in the document!"
      />
    );
    expect(getByTestId("testing-error")).toBeInTheDocument();
  });
});
