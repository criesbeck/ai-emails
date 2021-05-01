import React from "react";
import {
  Flex,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { Students } from "../help-system";
import {
  useStudents,
  useGoHome,
  StudentMessage,
  useSendEmails,
} from "./useStudents";

const TableLabels = () => {
  return (
    <Tr>
      <Th>Student</Th>
      <Th>Message</Th>
    </Tr>
  );
};

interface StudentEmailProps {
  student: StudentMessage;
}

const StudentEmail: React.FC<StudentEmailProps> = ({ student }) => {
  return (
    <Tr>
      <Td>
        <Flex flexDirection="column" alignItems="center">
          <Text>{student.name}</Text>
          <Text>{student.email}</Text>
        </Flex>
      </Td>
      <Td>
        <Flex maxWidth="300px">{student.message}</Flex>
      </Td>
    </Tr>
  );
};

const EmailTable: React.FC<Students> = ({ students }) => {
  const { storedStudents } = useStudents();
  return (
    <Table variant="simple">
      <TableCaption>Emails to Send</TableCaption>
      <Thead>
        <TableLabels />
      </Thead>
      <Tbody>
        {students.map((student) =>
          storedStudents[student.id].finished ? (
            <StudentEmail
              key={student.id}
              student={storedStudents[student.id]}
            />
          ) : null
        )}
      </Tbody>
      <Tfoot>
        <TableLabels />
      </Tfoot>
    </Table>
  );
};

const GoBack = () => {
  const goHome = useGoHome();
  return (
    <Button onClick={goHome} colorScheme="teal">
      Go back
    </Button>
  );
};

const Send: React.FC<Students> = (props) => {
  const {
    sendEmails,
    mutation: { isLoading },
  } = useSendEmails(props);
  return (
    <Button onClick={sendEmails} colorScheme="blue">
      {isLoading ? <Spinner size="sm" /> : `Send Emails`}
    </Button>
  );
};

const EmailButtons: React.FC<Students> = ({ students }) => {
  return (
    <Flex py="16px" minWidth="300px" justifyContent="space-between">
      <GoBack />
      <Send students={students} />
    </Flex>
  );
};

const EmailConfirmation: React.FC<Students> = ({ students }) => {
  return (
    <Flex
      data-testid="confirm-emails-page"
      flexDirection="column"
      alignItems="center"
    >
      <Heading size="lg">Confirmation</Heading>
      <EmailButtons students={students} />
      <EmailTable students={students} />
      <EmailButtons students={students} />
    </Flex>
  );
};

export default EmailConfirmation;
