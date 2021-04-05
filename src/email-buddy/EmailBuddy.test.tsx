import axios from "axios";
import AxiosMock from "axios-mock-adapter";
import { fetchEmailStatistics } from "./EmailBuddy";
import { render, waitFor } from "@testing-library/react";
import App from "../App";
import { queryClient } from "../components/Providers";

console.error = jest.fn();
const mock = new AxiosMock(axios);

beforeEach(() => {
  mock.reset();
  queryClient.removeQueries("statistics");
});

describe("Our email fetcher component", () => {
  test("Renders an error message when there's an error", async () => {
    mock.onGet("/example-submission-data.json").networkError();
    mock.onGet("/authors.json").networkError();
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("emails-error")).toBeInTheDocument();
    });
  });
  test("Fetch course stats makes the right API calls", async () => {
    mock.onGet("/example-submission-data.json").reply(200, "emails");
    mock.onGet("/authors.json").reply(200, "authors");
    const [emails, authors] = await fetchEmailStatistics();
    expect(emails).toBe("emails");
    expect(authors).toBe("authors");
  });
  test("Renders loading initially", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("emails-loading")).toBeInTheDocument();
  });
  test("Renders a nothing found message when nothing is found", async () => {
    mock.onGet("/example-submission-data.json").reply(200, { submissions: {} });
    mock.onGet("/authors.json").reply(200, { authors: {} });
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("emails-missing")).toBeInTheDocument();
    });
  });
  test("Renders the email message when emails are found", async () => {
    mock
      .onGet("/example-submission-data.json")
      .reply(200, { submissions: { x: 3 } });
    mock.onGet("/authors.json").reply(200, { authors: {} });
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("emails-view")).toBeInTheDocument();
    });
  });
});
