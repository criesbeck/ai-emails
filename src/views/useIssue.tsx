import React from "react";
import { Tag } from "../help-system";
import axios from "axios";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

const updateIssue = async (issue: Tag) => {
  const formBody = new FormData();
  formBody.append(`${issue.id}`, JSON.stringify(issue));
  await axios.put(process.env.REACT_APP_TEMPLATES_URL!, formBody);
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
      window.location.href = "/";
    } catch (err) {
      toast.error(
        "Something went wrong. Please refresh the page and try again."
      );
    }
  }, [mutation, issue, issueText]);
  return { issueText, changeIssue, saveIssueChanges, mutation };
};

export default useIssue;
