import React from "react";
import { Tag } from "../help-system";
import axios from "axios";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

const normalizeSubject = (subject: string) => {
  return subject.replace(/[0-9]/g, "").trim();
};

const updateIssue = async (issue: Tag) => {
  const formBody = new FormData();
  formBody.append("id", `${issue.id}`);
  formBody.append("name", issue.name);
  formBody.append("subject", normalizeSubject(issue.subject));
  formBody.append("template", issue.template);
  await axios.put(process.env.REACT_APP_PUT_TEMPLATES_URL!, formBody);
};

const useIssue = (issue: Tag) => {
  const [issueText, setIssueText] = React.useState<string>(issue.template);
  const changeIssue: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    (event) => {
      setIssueText(event.target.value);
    },
    [setIssueText]
  );
  const mutation = useMutation(`update-issue-${issue.id}`, updateIssue);
  const saveIssueChanges = React.useCallback(async () => {
    try {
      await mutation.mutateAsync({ ...issue, template: issueText });
      toast.success("Success! Redirecting...");
      window.location.reload();
    } catch (err) {
      toast.error(
        "Something went wrong. Please refresh the page and try again."
      );
    }
  }, [mutation, issue, issueText]);
  return { issueText, changeIssue, saveIssueChanges, mutation };
};

export default useIssue;
