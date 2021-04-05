import { Flex, Heading, Spinner } from "@chakra-ui/react";
import { useQuery } from "react-query";
import { Submissions, Authors } from "./ApiTypes";
import axios from "axios";
import AlertError from "../components/AlertError";

export const fetchEmailStatistics = async (): Promise<
  [Submissions, Authors]
> => {
  const [rawEmails, rawAuthors] = (
    await Promise.all([
      axios.get("/example-submission-data.json"),
      axios.get("/authors.json"),
    ])
  )?.map((el) => el.data);
  const emails = rawEmails as Submissions;
  const authors = rawAuthors as Authors;
  return [emails, authors];
};

const EmailsError = () => {
  return (
    <Flex maxWidth="250px">
      <AlertError
        show
        message="A network error occured. Try refreshing."
        data-testid="emails-error"
      />
    </Flex>
  );
};

const EmailsLoading = () => {
  return (
    <Flex data-testid="emails-loading">
      <Spinner size="lg" width="50px" height="50px" speed="1s" />
    </Flex>
  );
};

const EmailsMissing = () => {
  return (
    <Flex data-testid="emails-missing">There is no submission data yet.</Flex>
  );
};

export interface EmailViewProps {
  submissions: Submissions;
  authors: Authors;
}

const EmailsView: React.FC<EmailViewProps> = () => {
  return <Flex data-testid="emails-view">Hello!</Flex>;
};

interface EmailRouterProps {
  data: [Submissions, Authors] | undefined;
  isError: boolean;
  isLoading: boolean;
}

const EmailsRouter: React.FC<EmailRouterProps> = ({
  data,
  isError,
  isLoading,
}) => {
  if (isError) return <EmailsError />;
  if (isLoading || !data) return <EmailsLoading />;
  const [submissions, authors] = data;
  return Object.keys(submissions?.submissions).length === 0 ? (
    <EmailsMissing />
  ) : (
    <EmailsView submissions={submissions} authors={authors} />
  );
};

const EmailBuddy = () => {
  const { data, isError, isLoading } = useQuery(
    "statistics",
    fetchEmailStatistics,
    { retry: false }
  );
  return (
    <Flex width="100%" alignItems="center" flexDirection="column" p="24px">
      <Heading pb="16px">Student Progress</Heading>
      <EmailsRouter data={data} isError={isError} isLoading={isLoading} />
    </Flex>
  );
};

export default EmailBuddy;
