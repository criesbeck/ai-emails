import React from "react";
import { Students } from "../help-system";
import { EmailViewElements } from "./EmailCore";
import Worker from "../worker";

export interface UseAuthors {
  loading: boolean;
  results: Students;
}

const useOrderStudents = (els: EmailViewElements) => {
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState<Students>({
    students: [],
  });
  const sortStudents = React.useCallback(async () => {
    setLoading(true);
    const worker = new Worker();
    const res = (await worker.processStudents(els)) as Students;
    setStudents(res);
    setLoading(false);
  }, [els, setLoading]);
  return {
    loading,
    students,
    sortStudents,
  };
};

const useAuthors = (els: EmailViewElements): UseAuthors => {
  const [time, setCurrentTime] = React.useState<number>(0);
  const { loading, students, sortStudents } = useOrderStudents(els);
  React.useEffect(() => {
    if (time === els.currentTime) return;
    setCurrentTime(els.currentTime);
    sortStudents();
  }, [sortStudents, els.currentTime, time]);
  return {
    loading,
    results: students,
  };
};

export default useAuthors;
