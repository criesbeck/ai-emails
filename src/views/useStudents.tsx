import React from "react";
import { useHistory } from "react-router-dom";
import {
  Student,
  Students,
  getInitialEmail,
  getStudentMap,
} from "../help-system";
import { useLocalStorage } from "react-use";
import axios from "axios";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

export interface StudentMessage {
  finished: boolean;
  touched: boolean;
  message: string;
  email: string;
  name: string;
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
  touched: false,
  message: "",
  email: "",
  name: "",
};

interface StudentState {
  storedStudents: StudentStorage;
  setStoredStudents: React.Dispatch<React.SetStateAction<{}>>;
}

export const StudentContext = React.createContext<StudentState | undefined>(
  undefined
);

export const getInitialStudents = ({ students }: Students) =>
  students.reduce((acc: StudentStorage, el) => {
    return {
      ...acc,
      [el.id]: {
        ...DEFAULT_STORAGE,
        email: el.email,
        name: el.name,
        message: getInitialEmail(el),
      },
    };
  }, {});

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
    storedStudents[student.id].touched
      ? storedStudents[student.id].message
      : getInitialEmail(student)
  );
  const editMessage: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    (event) => {
      setMessage(event.target.value);
      if (storedStudents[student.id].touched === true) return;
      setStoredStudents({
        ...storedStudents,
        [student.id]: { ...storedStudents[student.id], touched: true },
      });
    },
    [setMessage, storedStudents, setStoredStudents, student.id]
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

const useMassSetter = (finished: boolean) => {
  const { storedStudents, setStoredStudents } = useStudents();
  const toggler = React.useCallback(() => {
    const newStudents = Object.entries(storedStudents).reduce(
      (acc, [id, message]) => {
        return { ...acc, [id]: { ...message, finished } };
      },
      {}
    );
    setStoredStudents(newStudents);
  }, [storedStudents, setStoredStudents, finished]);
  return toggler;
};

export const useCheckboxHelper = () => {
  const setFinished = useMassSetter(true);
  const setUnfinished = useMassSetter(false);
  return { setFinished, setUnfinished };
};

export const useGotoConfirmation = () => {
  const history = useHistory();
  const gotoConfirmation = React.useCallback(() => {
    history.push("/confirm");
  }, [history]);
  return gotoConfirmation;
};

interface PostEmailProps {
  students: Students;
  storedStudents: StudentStorage;
}

type EmailPost = (els: PostEmailProps) => Promise<void>;

const postEmails: EmailPost = async ({ students, storedStudents }) => {
  const body = new FormData();
  const curStudents = getStudentMap(students.students);
  Object.entries(storedStudents).forEach(
    ([id, { email, message, finished }]) => {
      if (!finished) return;
      const issueNames = curStudents[id].issues
        .map((issue) => issue.name)
        .join(":");
      body.append("id", id);
      body.append("email", email);
      body.append("message", message);
      body.append("issues", issueNames);
    }
  );
  await axios.post(process.env.REACT_APP_POST_EMAILS_URL!, body);
};

export const useSendEmails = (students: Students) => {
  const { storedStudents, setStoredStudents } = useStudents();
  const goHome = useGoHome();
  const mutation = useMutation("emails", postEmails);
  const sendEmails = React.useCallback(async () => {
    try {
      await mutation.mutateAsync({ storedStudents, students });
      setStoredStudents(getInitialStudents(students));
      goHome();
      toast.success("Emails sent successfully.");
    } catch (err) {
      toast.error(
        `Something went wrong. Please refresh the page and try again.`
      );
    }
  }, [mutation, storedStudents, goHome, setStoredStudents, students]);
  return { sendEmails, mutation };
};

export const useLocalStudents = (students: Students) => {
  const initialStudents = getInitialStudents(students);
  const [storedStudents, setStoredStudents] = useLocalStorage(
    "students",
    initialStudents
  );
  return {
    storedStudents: storedStudents || getInitialStudents(students),
    setStoredStudents,
  };
};
