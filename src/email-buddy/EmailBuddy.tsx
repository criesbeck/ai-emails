import { useQuery } from "react-query";
import axios from "axios";

export const fetchEmailStatistics = async () => {
  const [emails, authors] = (
    await Promise.all([
      axios.get("/example-submission-data.json"),
      axios.get("/authors.json"),
    ])
  )?.map((el) => el.data);
  return [emails, authors] as const;
};

const EmailBuddy = () => {
  const { data, isError, isLoading } = useQuery(
    "statistics",
    fetchEmailStatistics,
    { retry: false }
  );
  if (isError) return <h1 data-testid="emails-error">Error message</h1>;
  if (isLoading || !data)
    return <h1 data-testid="emails-loading">Loading...</h1>;
  const [emails] = data;
  if (emails?.length === 0)
    return <h1 data-testid="emails-missing">Nothing found.</h1>;
  return <h1 data-testid="emails-view">Hello, world!</h1>;
};

export default EmailBuddy;
