import axios from "axios";
import AxiosMock from "axios-mock-adapter";
import { fetchEmailStatistics } from "./EmailGateway";
import { render, waitFor } from "@testing-library/react";
import App from "../App";
import { queryClient } from "./Providers";
import submissions from "../../public/example-submission-data.json";
import authors from "../../public/authors.json";
import poke from "../../public/poke-325-export.json";

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
    mock.onGet("/poke-325-export.json").networkError();
    mock.onGet("/templates").networkError();
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("emails-error")).toBeInTheDocument();
    });
  });
  test("Fetch course stats makes the right API calls", async () => {
    mock
      .onGet("/example-submission-data.json")
      .reply(200, { submissions: "submissions" });
    mock.onGet("/authors.json").reply(200, { authors: "authors" });
    mock.onGet("/poke-325-export.json").reply(200, { authors: "authors" });
    mock.onGet("/templates").reply(200, { templates: "templates" });
    const { submissions, authors } = await fetchEmailStatistics();
    expect(submissions.submissions).toBe("submissions");
    expect(authors.authors).toBe("authors");
  });
  test("Renders loading initially", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("emails-loading")).toBeInTheDocument();
  });
  test("Renders a nothing found message when nothing is found", async () => {
    mock.onGet("/example-submission-data.json").reply(200, { submissions: {} });
    mock.onGet("/authors.json").reply(200, { authors: {} });
    mock.onGet("/poke-325-export.json").reply(200, { authors: {} });
    mock.onGet("/templates").reply(200, { templates: {} });
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("emails-missing")).toBeInTheDocument();
    });
  });
  test("Renders the email message when emails are found", async () => {
    mock.onGet("/example-submission-data.json").reply(200, submissions);
    mock.onGet("/authors.json").reply(200, authors);
    mock.onGet("/poke-325-export.json").reply(200, poke);
    mock.onGet("/templates").reply(200, { templates: {} });
    const { getByTestId } = render(<App />);
    await waitFor(() => {
      expect(getByTestId("emails-view")).toBeInTheDocument();
    });
  });
});
