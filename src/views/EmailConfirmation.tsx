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
} from "@chakra-ui/react";
import { Students } from "../help-system";
import { useStudents, useGoHome, StudentMessage } from "./useStudents";

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
        {students.map((student) => (
          <StudentEmail key={student.id} student={storedStudents[student.id]} />
        ))}
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

const Send = () => {
  return <Button colorScheme="blue">Send</Button>;
};

const EmailButtons = () => {
  return (
    <Flex py="16px" minWidth="300px" justifyContent="space-between">
      <GoBack />
      <Send />
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
      <EmailButtons />
      <EmailTable students={students} />
      <EmailButtons />
    </Flex>
  );
};

export default EmailConfirmation;
