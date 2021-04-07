import React from "react";
import dayjs from "dayjs";
import { Submission } from "./ApiTypes";
import { EmailViewElements } from "./EmailsView";
import _ from "lodash";

export const partitionIntoWeeks = (
  submissions: Submission[]
): Array<Array<Submission>> => {
  const lastSubmission = submissions[submissions.length - 1].submitted;
  const submissionsWithWeeks = submissions.map((submission) => ({
    ...submission,
    week: dayjs(lastSubmission).diff(submission.submitted, "week"),
  }));
  const weeks = Object.values(
    _(submissionsWithWeeks).groupBy("week").value()
  ).reverse();
  return weeks.map((week) =>
    week
      .map((submission) => ({
        submitted: submission.submitted,
        exid: submission.exid,
        author: submission.author,
        status: submission.status,
      }))
      .sort((a, b) => a.submitted - b.submitted)
  );
};

const useAuthors = (els: EmailViewElements) => {
  const weeks = React.useMemo(
    () => partitionIntoWeeks(Object.values(els.submissions.submissions)),
    [els]
  );
  console.log("weeks", weeks);
  return els.authors;
};

export default useAuthors;
