import EmailsView from "./EmailsView";
import { render, waitFor } from "@testing-library/react";
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
});
