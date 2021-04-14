import EmailsView from "./EmailsView";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import submissionJson from "../../public/example-submission-data.json";
import authorsJson from "../../public/authors.json";
import pokeJson from "../../public/poke-325-export.json";

document.createRange = () => {
  const range = new Range();
  range.getBoundingClientRect = jest.fn();
  // @ts-ignore
  range.getClientRects = jest.fn(() => ({
    item: () => null,
    length: 0,
  }));
  return range;
};

const TestEmails = () => {
  return (
    <EmailsView
      data={{
        authors: authorsJson,
        // @ts-ignore
        submissions: submissionJson,
        // @ts-ignore
        poke: pokeJson,
      }}
    />
  );
};

describe("Our emails view", () => {
  test("Renders the authors you give it", async () => {
    const { getByText } = render(<TestEmails />);
    await waitFor(() => {
      expect(getByText("Twila Penning")).toBeInTheDocument();
    });
  });
  test("Opens the appropriate email modal when you click the email button", async () => {
    const { getByText, getByTestId } = render(<TestEmails />);
    await waitFor(() => {
      expect(getByText("Twila Penning")).toBeInTheDocument();
    });
    await act(async () => {
      const button = getByTestId("Twila-Penning-email-button");
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(getByTestId("Twila-Penning-email-modal")).toBeInTheDocument();
    });
  });
});
