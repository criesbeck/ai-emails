import React from "react";
import { useHistory } from "react-router-dom";
import { Student, Students, getInitialEmail } from "../help-system";
import { useLocalStorage } from "react-use";

export interface StudentMessage {
  finished: boolean;
  message: string;
}

export type StudentStorage = Record<string, StudentMessage>;

export const useGoHome = () => {
  const history = useHistory();
  const goHome = React.useCallback(() => {
    history.push("/");
  }, [history]);
  return goHome;
};

export const DEFAULT_STORAGE: StudentMessage = {
  finished: false,
  message: "",
};

interface StudentState {
  storedStudents: StudentStorage;
  setStoredStudents: React.Dispatch<React.SetStateAction<{}>>;
}

export const StudentContext = React.createContext<StudentState | undefined>(
  undefined
);

export const getInitialStudents = ({ students }: Students) =>
  students.reduce(
    (acc: StudentStorage, el) => ({ ...acc, [el.id]: DEFAULT_STORAGE }),
    {}
  );

export const useStudents = () => {
  const ctx = React.useContext(StudentContext);
  if (ctx === undefined) {
    throw new Error(`useStudents must be used inside its provider!`);
  }
  return ctx;
};

const useToggleFinished = (student: Student) => {
  const { storedStudents, setStoredStudents } = useStudents();
  const toggleFinished = React.useCallback(() => {
    setStoredStudents({
      ...storedStudents,
      [student.id]: {
        ...storedStudents[student.id],
        finished: !storedStudents[student.id].finished,
      },
    });
  }, [storedStudents, setStoredStudents, student.id]);
  return toggleFinished;
};

const useMessage = (student: Student) => {
  const { storedStudents, setStoredStudents } = useStudents();
  const goHome = useGoHome();
  const [message, setMessage] = React.useState<string>(
    storedStudents[student.id].message || getInitialEmail(student)
  );
  const editMessage: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    (event) => setMessage(event.target.value),
    [setMessage]
  );
  const saveMessage = React.useCallback(() => {
    setStoredStudents({
      ...storedStudents,
      [student.id]: { ...storedStudents[student.id], finished: true, message },
    });
    goHome();
  }, [goHome, setStoredStudents, storedStudents, student.id, message]);
  return { message, editMessage, saveMessage };
};

export const useStudent = (student: Student) => {
  const { storedStudents } = useStudents();
  const toggleFinished = useToggleFinished(student);
  const { message, editMessage, saveMessage } = useMessage(student);
  return {
    storage: storedStudents[student.id],
    toggleFinished,
    message,
    editMessage,
    saveMessage,
  };
};

export const useGotoConfirmation = () => {
  const history = useHistory();
  const gotoConfirmation = React.useCallback(() => {
    history.push("/confirm");
  }, [history]);
  return gotoConfirmation;
};

export const useLocalStudents = (students: Students) => {
  const [storedStudents, setStoredStudents] = useLocalStorage(
    "students",
    getInitialStudents(students)
  );
  return {
    storedStudents: storedStudents || getInitialStudents(students),
    setStoredStudents,
  };
};
