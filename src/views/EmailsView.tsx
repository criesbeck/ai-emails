import React from "react";
import { Flex } from "@chakra-ui/react";
import EmailsLoading from "./EmailsLoading";
import TimePicker from "./TimePicker";
import EmailCore, { EmailCoreProps } from "./EmailCore";

import { getLatestSubmission } from "../help-system";
import useAuthors from "./useAuthors";

const EmailViewController: React.FC<EmailCoreProps> = (props) => {
  const [currentTime, setCurrentTime] = React.useState<number>(
    getLatestSubmission(props.data.submissions.submissions)
  );
  const { loading, results } = useAuthors({
    data: props.data,
    currentTime,
  });
  const { students, emailedStudents } = results;
  if (loading || (students.length <= 0 && emailedStudents.length <= 0))
    return <EmailsLoading />;
  return (
    <>
      <TimePicker currentTime={currentTime} setCurrentTime={setCurrentTime} />
      <EmailCore students={students} emailedStudents={emailedStudents} />
    </>
  );
};

const EmailsView: React.FC<EmailCoreProps> = (props) => {
  return (
    <Flex data-testid="emails-view" flexDirection="column" alignItems="center">
      <EmailViewController data={props.data} />
    </Flex>
  );
};

export default EmailsView;
