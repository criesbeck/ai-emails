import { orderStudents } from "../help-system/studentRanker";
import { Authors } from "../help-system/CriticStructure";
import { EmailViewElements } from "./EmailsView";

export interface UseAuthors {
  authors: Authors;
  numWeeks: number;
}

const useAuthors = (els: EmailViewElements): UseAuthors => {
  const { numWeeks } = orderStudents(els);
  return {
    authors: els.data.authors.authors,
    numWeeks: numWeeks,
  };
};

export default useAuthors;
