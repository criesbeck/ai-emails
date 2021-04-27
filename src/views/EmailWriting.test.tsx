import fs from "fs";
import path from "path";
import { render, fireEvent } from "@testing-library/react";
import { Students } from "../help-system";
import { MemoryRouter } from "react-router-dom";
import EmailCore from "./EmailCore";

const studentsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./students.json"), "utf-8")
) as Students;

describe("Getting to the page", () => {
  test("We can navigate between pages by clicking on the right buttons", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <EmailCore students={studentsJson.students} />
      </MemoryRouter>
    );
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
    const { getByTestId } = render(
      <MemoryRouter>
        <EmailCore students={studentsJson.students} />
      </MemoryRouter>
    );
    const confirmEmails = getByTestId("goto-confirm-emails");
    fireEvent.click(confirmEmails);
    expect(getByTestId("Brazil-Velazquez-email-button")).toBeInTheDocument();
    for (let i = 0; i < checkboxes.length; ++i) {
      const button = getByTestId(checkboxes[i]);
      fireEvent.click(button);
    }
    fireEvent.click(confirmEmails);
    expect(getByTestId("confirm-emails-page")).toBeInTheDocument();
  });
});
