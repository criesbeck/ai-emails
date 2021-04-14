import React from "react";
import { Flex, Spinner } from "@chakra-ui/react";

const EmailsLoading: React.FC = () => {
  return (
    <Flex data-testid="emails-loading">
      <Spinner size="lg" width="50px" height="50px" speed="1s" />
    </Flex>
  );
};

export default EmailsLoading;
