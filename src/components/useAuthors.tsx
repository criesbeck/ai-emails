import { orderStudents } from "../help-system/studentRanker";
import { Student } from "../help-system/tagStructure";
import { EmailViewElements } from "./EmailsView";

export interface UseAuthors {
  authors: Student;
  numWeeks: number;
}

const useAuthors = (els: EmailViewElements) => orderStudents(els);

export default useAuthors;
