import { orderStudents, StudentHelp } from "../help-system/studentRanker";
import { EmailViewElements } from "./EmailsView";

export interface UseAuthors {
  loading: boolean;
  results: StudentHelp;
}

const useAuthors = (els: EmailViewElements): UseAuthors => {
  return {
    loading: false,
    results: orderStudents(els),
  };
};

export default useAuthors;
