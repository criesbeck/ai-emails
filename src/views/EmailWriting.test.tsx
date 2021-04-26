import fs from "fs";
import path from "path";
import { render, fireEvent } from "@testing-library/react";
import { StudentHelp } from "../help-system";
import EmailCore from "./EmailCore";

const studentsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./students.json"), "utf-8")
) as StudentHelp;

describe("Getting to the page", () => {
  test("We can navigate between pages by clicking on the right buttons", () => {
    const { getByTestId } = render(
      <EmailCore
        students={studentsJson.students}
        studentMap={studentsJson.studentMap}
      />
    );
    const button = getByTestId("Brazil-Velazquez-email-button");
    fireEvent.click(button);
    expect(getByTestId("edit-student-message")).toBeInTheDocument();
    const goHome = getByTestId("go-home");
    fireEvent.click(goHome);
    expect(getByTestId("Brazil-Velazquez-email-button")).toBeInTheDocument();
  });
});
