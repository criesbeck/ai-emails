import fs from "fs";
import path from "path";
import { TestInputs, TestCase } from "./test-types";
import { ApiResponse } from "../CriticStructure";
import { Student, Tag } from "../tagStructure";
import { orderStudents } from "../studentRanker";

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

describe("Our student error finder can detect issues", () => {
  inputs.tests.forEach((testCase) => {
    runTest(testCase);
  });
});
