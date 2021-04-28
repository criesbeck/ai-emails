import fs from "fs";
import path from "path";
import { render, fireEvent } from "@testing-library/react";
import { Students } from "../help-system";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import EmailCore from "./EmailCore";

const studentsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./students.json"), "utf-8")
) as Students;

const client = new QueryClient();

const Body = () => {
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <EmailCore students={studentsJson.students} />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Getting to the page", () => {
  test("We can navigate between pages by clicking on the right buttons", () => {
    const { getByTestId } = render(<Body />);
    const button = getByTestId("Brazil-Velazquez-email-button");
    fireEvent.click(button);
    expect(getByTestId("edit-student-message")).toBeInTheDocument();
    const goHome = getByTestId("go-home");
    fireEvent.click(goHome);
    expect(getByTestId("Brazil-Velazquez-email-button")).toBeInTheDocument();
  });
  test("We can navigate to the confirmation page after we finish all students", () => {
    const checkboxes = studentsJson.students.map(
      (student) => `${student.name.replace(" ", "-")}-checkbox`
    );
    const { getByTestId } = render(<Body />);
    const confirmEmails = getByTestId("goto-confirm-emails");
    checkboxes.forEach((box) => fireEvent.click(getByTestId(box)));
    fireEvent.click(confirmEmails);
    expect(getByTestId("confirm-emails-page")).toBeInTheDocument();
  });
});
