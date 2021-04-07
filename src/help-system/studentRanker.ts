import { Submission, Authors } from "./CriticStructure";
import dayjs from "dayjs";
import _ from "lodash";

export type Weeks = Array<Array<Submission>>;

export interface TroubleMap {
  weeks: Weeks;
  authors: Authors;
  currentWeek: number;
}

export const orderStudents = (trouble: TroubleMap): Authors => {
  return trouble.authors;
};

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
