import fs from "fs";
import path from "path";
import { render } from "@testing-library/react";
import { StudentHelp } from "../help-system/studentRanker";
import EmailCore from "./EmailCore";

const studentsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./students.json"), "utf-8")
) as StudentHelp;

global.window = Object.create(window);
Object.defineProperty(window, "location", {
  value: {
    href: "/",
  },
  writable: true,
});

beforeEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { assign: jest.fn() },
  });
  window.location.pathname = "/";
});

describe("Our email core", () => {
  test("Renders the students table at /", () => {
    const { getByTestId } = render(
      <EmailCore
        students={studentsJson.students}
        studentMap={studentsJson.studentMap}
      />
    );
    expect(getByTestId("email-core-table")).toBeInTheDocument();
  });
  test("Renders a 404 message when we can't find the student at /:id", () => {
    window.location.pathname = "/32";
    const { getByTestId } = render(
      <EmailCore
        students={studentsJson.students}
        studentMap={studentsJson.studentMap}
      />
    );
    expect(getByTestId("student-missing")).toBeInTheDocument();
  });
  test("Renders the edit message view when we can find the student at /:id", () => {
    window.location.pathname = "/1796";
    const { getByTestId } = render(
      <EmailCore
        students={studentsJson.students}
        studentMap={studentsJson.studentMap}
      />
    );
    expect(getByTestId("edit-student-message")).toBeInTheDocument();
  });
});
