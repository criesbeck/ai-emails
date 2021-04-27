import React from "react";
import { useHistory } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { Student, getInitialEmail } from "../help-system";

export interface LocalStudentStorage {
  finished: boolean;
  message: string;
}

export const useGoHome = () => {
  const history = useHistory();
  const goHome = React.useCallback(() => {
    history.push("/");
  }, [history]);
  return goHome;
};

export const DEFAULT_STORAGE: LocalStudentStorage = {
  finished: false,
  message: "",
};

export const useStoredStudent = (student: Student) => {
  const goHome = useGoHome();
  const [storage, setStorage] = useLocalStorage<LocalStudentStorage>(
    `${student.id}`,
    { finished: false, message: getInitialEmail(student) }
  );
  const toggleFinished = React.useCallback(() => {
    const toSpread = { ...DEFAULT_STORAGE, ...storage };
    setStorage({ ...toSpread, finished: !storage?.finished });
  }, [setStorage, storage]);
  const [message, setMessage] = React.useState<string>(
    storage?.message || getInitialEmail(student)
  );
  const editMessage: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    (event) => setMessage(event.target.value),
    [setMessage]
  );
  const saveMessage = React.useCallback(() => {
    setStorage({ finished: true, message: message });
    goHome();
  }, [message, setStorage, goHome]);
  return { storage, toggleFinished, message, editMessage, saveMessage };
};
