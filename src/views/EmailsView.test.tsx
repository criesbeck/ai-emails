import EmailsView from "./EmailsView";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import submissionJson from "../../server/example-submission-data.json";
import authorsJson from "../../server/authors.json";
import pokeJson from "../../server/poke-325-export.json";

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
    <MemoryRouter>
      <EmailsView
        data={{
          authors: authorsJson,
          // @ts-ignore
          submissions: submissionJson,
          // @ts-ignore
          poke: pokeJson,
        }}
      />
    </MemoryRouter>
  );
};

describe("Our emails view", () => {
  test("Renders the authors you give it", async () => {
    const { getByTestId } = render(<TestEmails />);
    await waitFor(() => {
      expect(getByTestId("Twila-Penning-checkbox")).toBeInTheDocument();
    });
  });
});
