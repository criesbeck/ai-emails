import React from "react";
import dayjs from "dayjs";
import { Submission } from "./ApiTypes";
import { EmailViewElements } from "./EmailsView";
import _ from "lodash";

export const partitionIntoWeeks = (
  submissions: Submission[]
): Array<Array<Submission>> => {
  const lastSubmission = submissions[submissions.length - 1].submitted;
  return Object.values(
    _(submissions)
      .groupBy((submission) =>
        dayjs(lastSubmission).diff(submission.submitted, "week")
      )
      .value()
  ).reverse();
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
