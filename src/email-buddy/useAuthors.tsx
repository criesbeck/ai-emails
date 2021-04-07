import React from "react";
import { Authors } from "./ApiTypes";
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

export interface UseAuthors {
  authors: Authors;
  numWeeks: number;
}

const useAuthors = (els: EmailViewElements): UseAuthors => {
  const weeks = React.useMemo(
    () => partitionIntoWeeks(Object.values(els.submissions.submissions)),
    [els.submissions.submissions]
  );
  return { authors: els.authors, numWeeks: weeks.length };
};

export default useAuthors;
