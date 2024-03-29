import { Flex, Heading } from "@chakra-ui/react";
import { useQuery } from "react-query";
import axios from "axios";
import AlertError from "./AlertError";
import EmailsLoading from "./EmailsLoading";
import EmailsView from "./EmailsView";
import { ApiResponse } from "../help-system";

export const fetchEmailStatistics = async (): Promise<ApiResponse> => {
  const [submissions, authors, poke, templates, emailHistory] = (
    await Promise.all([
      axios.get(process.env.REACT_APP_SUBMISSION_DATA!),
      axios.get(process.env.REACT_APP_AUTHORS!),
      axios.get(process.env.REACT_APP_POKE!),
      axios.get(process.env.REACT_APP_TEMPLATES_URL!),
      axios.get(process.env.REACT_APP_GET_EMAILS_URL!),
    ])
  )?.map((el) => el.data);
  return { submissions, authors, poke, templates, emailHistory };
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
