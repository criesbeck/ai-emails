import { Flex, Heading, Spinner } from "@chakra-ui/react";
import { useQuery } from "react-query";
import axios from "axios";
import AlertError from "./AlertError";
import EmailsView from "./EmailsView";
import { ApiResponse } from "../help-system/CriticStructure";

export const fetchEmailStatistics = async (): Promise<ApiResponse> => {
  console.log(process.env);
  console.log(process.env.NODE_ENV);
  console.log(process.env.REACT_APP_AUTHORS);
  console.log(process.env.REACT_APP_POKE);
  console.log(process.env.REACT_APP_POKE);
  const [submissions, authors, poke] = (
    await Promise.all([
      axios.get(process.env.REACT_APP_SUBMISSION_DATA!),
      axios.get(process.env.REACT_APP_AUTHORS!),
      axios.get(process.env.REACT_APP_POKE!),
    ])
  )?.map((el) => el.data);
  return { submissions, authors, poke };
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

interface EmailRouterProps {
  data: ApiResponse | undefined;
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
  const { submissions } = data;
  return Object.keys(submissions.submissions).length === 0 ? (
    <EmailsMissing />
  ) : (
    <EmailsView data={data} />
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
