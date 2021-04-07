import { Submission, Authors } from "./CriticStructure";
import dayjs from "dayjs";
import _ from "lodash";

export type Weeks = Array<Array<Submission>>;

export const partitionIntoWeeks = (submissions: Submission[]): Weeks => {
  const lastSubmission = submissions[submissions.length - 1].submitted;
  return Object.values(
    _(submissions)
      .groupBy((submission) =>
        dayjs(lastSubmission).diff(submission.submitted, "week")
      )
      .value()
  ).reverse();
};

export interface StudentInformation {
  data: any;
  currentWeek: number;
}

export interface StudentHelp {
  numWeeks: number;
}

export const orderStudents = (_: StudentInformation): StudentHelp => {
  return { numWeeks: 13 };
};
