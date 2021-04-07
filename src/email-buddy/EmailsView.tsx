import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Text,
  Select,
  Input,
  Flex,
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
import MarkdownEditor from "@uiw/react-markdown-editor";
import { Submissions, Authors, Author } from "./ApiTypes";
import useAuthors from "./useAuthors";

export type SelectStudent = (student: any) => void;

const TableColumnHeaders = () => {
  return (
    <Tr>
      <Th>Name</Th>
      <Th>Status</Th>
      <Th>Send Message</Th>
    </Tr>
  );
};

interface TableAuthorProps {
  author: Author;
  submissions: Submissions;
  selectStudent: SelectStudent;
}

const TableAuthor: React.FC<TableAuthorProps> = ({ author, selectStudent }) => {
  const selectThisStudent = React.useCallback(() => {
    selectStudent(author);
  }, [selectStudent, author]);
  return (
    <Tr>
      <Td>{author.name}</Td>
      <Td>Fine</Td>
      <Td>
        <Button onClick={selectThisStudent} colorScheme="blue">
          Message
        </Button>
      </Td>
    </Tr>
  );
};

export interface TableRowProps {
  submissions: Submissions;
  authors: Authors;
  selectStudent: SelectStudent;
  currentWeek: number;
}

export interface EmailViewElements {
  submissions: Submissions;
  authors: Authors;
  currentWeek: number;
}

const TableRows: React.FC<TableRowProps> = (props) => {
  return (
    <>
      {Object.values(props.authors.authors).map((author) => (
        <TableAuthor
          key={author.id}
          author={author}
          selectStudent={props.selectStudent}
          submissions={props.submissions}
        />
      ))}
    </>
  );
};

interface WeekPickerProps {
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
  currentWeek: number;
  numWeeks: number;
}

const WeekPicker: React.FC<WeekPickerProps> = (props) => {
  const { setCurrentWeek, numWeeks, currentWeek } = props;
  const changeWeek = React.useCallback<
    React.ChangeEventHandler<HTMLSelectElement>
  >(
    (event) => {
      setCurrentWeek(Number.parseInt(event.target.value, 10));
    },
    [setCurrentWeek]
  );
  return (
    <Flex width="80%" justifyContent="space-around" pb="16px">
      <Text>Pick Week</Text>
      <Select placeholder="Pick Week" value={currentWeek} onChange={changeWeek}>
        {Array.from({ length: numWeeks }).map((_, index) => (
          <option key={index} value={index}>
            {index + 1}
          </option>
        ))}
      </Select>
    </Flex>
  );
};

export interface EmailTableProps {
  submissions: Submissions;
  authors: Authors;
  selectStudent: SelectStudent;
}

const EmailTable: React.FC<EmailTableProps> = (props) => {
  const { authors: apiAuthors, submissions, selectStudent } = props;
  const [currentWeek, setCurrentWeek] = React.useState<number>(0);
  const { authors, numWeeks } = useAuthors({
    authors: apiAuthors,
    submissions,
    currentWeek,
  });
  return (
    <>
      <WeekPicker
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        numWeeks={numWeeks}
      />
      <Table variant="simple">
        <TableCaption>Students</TableCaption>
        <Thead>
          <TableColumnHeaders />
        </Thead>
        <Tbody>
          <TableRows
            currentWeek={currentWeek}
            authors={authors}
            selectStudent={selectStudent}
            submissions={submissions}
          />
        </Tbody>
        <Tfoot>
          <TableColumnHeaders />
        </Tfoot>
      </Table>
    </>
  );
};

const useStudentModal = () => {
  const [currentStudent, setCurrentStudent] = React.useState(null);
  const unselectStudent = React.useCallback(() => {
    setCurrentStudent(null);
  }, []);
  const selectStudent = React.useCallback((student) => {
    setCurrentStudent(student);
  }, []);
  return {
    currentStudent,
    selectStudent,
    unselectStudent,
  };
};

export interface EmailModalProps {
  currentStudent: any | null;
  unselectStudent: () => void;
}

const EmailModal: React.FC<EmailModalProps> = (props) => {
  const { currentStudent, unselectStudent } = props;
  return (
    <Modal size="lg" isOpen={currentStudent !== null} onClose={unselectStudent}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Email {currentStudent?.email}</ModalHeader>
        <ModalCloseButton />
        <Flex flexDirection="column" width="100%" pb="16px" px="24px">
          <Flex py="16px" alignItems="center">
            <Text fontWeight="600" pr="16px">
              Subject
            </Text>
            <Input />
          </Flex>
          <Text fontWeight="600" py="16px">
            Body
          </Text>
          <MarkdownEditor visible={false} height={500} />
          <Flex pt="16px">
            <Button colorScheme="teal">Send</Button>
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export interface EmailViewProps {
  authors: Authors;
  submissions: Submissions;
}

const EmailsView: React.FC<EmailViewProps> = (props) => {
  const { currentStudent, selectStudent, unselectStudent } = useStudentModal();
  return (
    <Flex data-testid="emails-view" flexDirection="column" alignItems="center">
      <EmailTable
        selectStudent={selectStudent}
        authors={props.authors}
        submissions={props.submissions}
      />
      <EmailModal
        currentStudent={currentStudent}
        unselectStudent={unselectStudent}
      />
    </Flex>
  );
};

export default EmailsView;
