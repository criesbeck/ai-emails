import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { TestInputs, TestCase } from "./test-types";
import { ApiResponse } from "../CriticStructure";
import { orderStudents } from "../studentRanker";
import {
  between,
  getEarliestSubmission,
  getLatestSubmission,
  isFirstWeek,
  getWeekBefore,
  emailedThisWeek,
  buildWeekArray,
  decayingAverage,
} from "../utils";

const readJson = (dir: string) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, dir), "utf-8"));

const data = readJson("api-data.json") as ApiResponse;
const inputs = readJson("test-cases.json") as TestInputs;

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
    const issue = student.issues.find((issue) => {
      return issue.subject.includes(testCase.issueName);
    });
    const testPassed = testCase.errorIfExists
      ? issue?.subject === undefined
      : issue?.subject !== undefined;
    expect(testPassed).toBe(true);
  });
};

describe("Checking if we've already a student this week", () => {
  test("We can tell when we have", () => {
    expect(
      emailedThisWeek(
        {
          name: "test",
          issues: [],
          id: 3,
          email: "arbitrary",
          previousEmail: "arbitrary",
        },
        {
          currentTime: 0,
          data: {
            submissions: {
              exercises: {},
              ai: [],
              challenge: [],
              submissions: {},
            },
            poke: { authors: {} },
            authors: { authors: {} },
            templates: {},
            emailHistory: {
              "3": [
                {
                  email: "test@test.com",
                  id: 3,
                  issues: ["test"],
                  message: "test",
                  submissionTime: Date.now(),
                },
              ],
            },
          },
        }
      )
    ).toBe(true);
  });
  test("We can tell when we have not", () => {
    expect(
      emailedThisWeek(
        {
          name: "test",
          issues: [],
          id: 3,
          email: "arbitrary",
          previousEmail: "arbitrary",
        },
        {
          currentTime: 0,
          data: {
            submissions: {
              exercises: {},
              ai: [],
              challenge: [],
              submissions: {},
            },
            poke: { authors: {} },
            authors: { authors: {} },
            templates: {},
            emailHistory: {
              "3": [
                {
                  email: "test@test.com",
                  id: 3,
                  issues: ["test"],
                  message: "test",
                  submissionTime: Date.now() - 1000 * 60 * 60 * 24 * 100,
                },
              ],
            },
          },
        }
      )
    ).toBe(false);
  });
});

describe("Our decaying average function", () => {
  test("Should work with no numbers", () => {
    expect(decayingAverage([])).toBe(0);
  });
  test("Should work with one number", () => {
    expect(decayingAverage([4])).toBe(4);
  });
  test("Should work with 2 numbers", () => {
    expect(decayingAverage([4, 3])).toBe(3.35);
  });
  test("Should work with 3 numbers", () => {
    expect(decayingAverage([4, 3, 3.5])).toBe(3.45);
  });
});

describe("Simple utils", () => {
  test("Between works", () => {
    expect(between(5, 1, 10)).toBe(true);
    expect(between(5, 11, 12)).toBe(false);
    expect(between(5, 1, 2)).toBe(false);
  });
});

describe("Building a week array", () => {
  test("Should work on an empty object", () => {
    const weekArray = buildWeekArray({}, 5);
    expect(weekArray).toEqual([0, 0, 0, 0, 0]);
  });
  test("Should work on a bigger object", () => {
    const weekArray = buildWeekArray({ 1: 3, 2: 4 }, 2);
    expect(weekArray).toEqual([3, 4]);
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
