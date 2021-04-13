import React from "react";
import { Alert, AlertIcon } from "@chakra-ui/react";

interface AlertErrorProps {
  message: string;
  show: boolean;
  "data-testid"?: string;
}

const AlertError: React.FC<AlertErrorProps> = (props) => {
  const { show, message } = props;
  if (!show) return null;
  return (
    <Alert status="error" data-testid={props["data-testid"]}>
      <AlertIcon />
      {message}
    </Alert>
  );
};

export default AlertError;
