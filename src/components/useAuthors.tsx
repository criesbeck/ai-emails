import React from "react";
import {
  partitionIntoWeeks,
  orderStudents,
} from "../help-system/studentRanker";
import { Authors } from "../help-system/CriticStructure";
import { EmailViewElements } from "./EmailsView";

export interface UseAuthors {
  authors: Authors;
  numWeeks: number;
}

const useAuthors = (els: EmailViewElements): UseAuthors => {
  const weeks = React.useMemo(
    () => partitionIntoWeeks(Object.values(els.submissions)),
    [els.submissions]
  );
  orderStudents({ authors: els.authors, weeks, currentWeek: els.currentWeek });
  return {
    authors: els.authors,
    numWeeks: weeks.length,
  };
};

export default useAuthors;
