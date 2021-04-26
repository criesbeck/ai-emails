import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { TestInputs, TestCase } from "./test-types";
import { ApiResponse } from "../CriticStructure";
import { Student, Tag } from "../tagStructure";
import { orderStudents } from "../studentRanker";
import {
  between,
  getEarliestSubmission,
  getLatestSubmission,
  isFirstWeek,
  getWeekBefore,
} from "../utils";

const readJson = (dir: string) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, dir), "utf-8"));

const data = readJson("api-data.json") as ApiResponse;
const inputs = readJson("test-cases.json") as TestInputs;

const logFailureContext = (testCase: TestCase, student: Student, tag?: Tag) => {
  console.log("TEST CASE: ", testCase);
  console.log("STUDENT: ", student);
  console.log("TAG: ", tag);
};

const findStudent = (testCase: TestCase) => {
  const { students } = orderStudents({
    data,
    currentTime: inputs.weeks[testCase.week],
  });
  const student = students.find(
    (student) => student.name === testCase.studentName
  );
  if (!student)
    throw new Error(`STUDENT ${testCase.studentName} DOES NOT EXIST`);
  return student;
};

const runTest = (testCase: TestCase) => {
  // eslint-disable-next-line jest/valid-title
  test(testCase.description, () => {
    const student = findStudent(testCase);
    const issue = student.issues.find(
      (issue) => issue.name === testCase.issueName
    );
    const testPassed = testCase.errorIfExists
      ? issue?.name === undefined
      : issue?.name === testCase.issueName;
    if (!testPassed) logFailureContext(testCase, student, issue);
    expect(testPassed).toBe(true);
  });
};

describe("Simple utils", () => {
  test("Between works", () => {
    expect(between(5, 1, 10)).toBe(true);
    expect(between(5, 11, 12)).toBe(false);
    expect(between(5, 1, 2)).toBe(false);
  });
});

describe("Some date/time functions", () => {
  test("Can get the earliest submission", () => {
    expect(getEarliestSubmission(data.submissions.submissions)).toBe(
      1538227718118
    );
  });
  test("Can get the latest submission", () => {
    expect(getLatestSubmission(data.submissions.submissions)).toBe(
      1546280678674
    );
  });
  test("Can check if a submission is before or during the first week", () => {
    expect(isFirstWeek(data.submissions.submissions, 0)).toBe(true);
    expect(isFirstWeek(data.submissions.submissions, 1538227718118)).toBe(true);
    expect(isFirstWeek(data.submissions.submissions, 1546280678674)).toBe(
      false
    );
  });
  test("Can go back in time a week", () => {
    expect(
      dayjs(getLatestSubmission(data.submissions.submissions)).format(
        "dddd D/M/YYYY"
      )
    ).toEqual("Monday 31/12/2018");
    expect(
      dayjs(
        getWeekBefore(getLatestSubmission(data.submissions.submissions))
      ).format("dddd D/M/YYYY")
    ).toEqual("Monday 24/12/2018");
  });
});

describe("Our student error finder can detect issues", () => {
  inputs.tests.forEach((testCase) => {
    runTest(testCase);
  });
});
