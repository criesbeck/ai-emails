import EmailsView from "./EmailsView";
import { render, fireEvent } from "@testing-library/react";
import submissionJson from "./example-submission-data.json";
import authorsJson from "./authors.json";
import { Authors, Submissions } from "./ApiTypes";

const authors = authorsJson.authors as Authors;
const submissions = submissionJson as Submissions;

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
  return <EmailsView authors={authors} submissions={submissions} />;
};

describe("Our emails view", () => {
  test("Renders the authors you give it", () => {
    const { getByText } = render(<TestEmails />);
    expect(getByText("Twila Penning")).toBeInTheDocument();
  });
  test("Opens the appropriate email modal when you click the email button", () => {
    const { getByTestId } = render(<TestEmails />);
    const button = getByTestId("Twila-Penning-email-button");
    fireEvent.click(button);
    expect(getByTestId("Twila-Penning-email-modal")).toBeInTheDocument();
  });
});
