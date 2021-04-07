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
  Tag,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { ApiResponse } from "../help-system/CriticStructure";
import { Student } from "../help-system/tagStructure";
import useAuthors from "./useAuthors";

export type SelectStudent = (student: Student) => void;

const TableColumnHeaders = () => {
  return (
    <Tr>
      <Th>Name</Th>
      <Th>Issues</Th>
      <Th>Send Message</Th>
    </Tr>
  );
};

interface TableAuthorProps {
  student: Student;
  selectStudent: SelectStudent;
}

const TableAuthor: React.FC<TableAuthorProps> = ({
  student,
  selectStudent,
}) => {
  const selectThisStudent = React.useCallback(() => {
    selectStudent(student);
  }, [selectStudent, student]);
  return (
    <Tr>
      <Td>{student.name}</Td>
      <Td>
        {student.issues.map((issue) => {
          return (
            <Tag colorScheme="teal" key={issue.name}>
              {issue.name}
            </Tag>
          );
        })}
      </Td>
      <Td>
        <Button
          data-testid={`${student.name.replace(" ", "-")}-email-button`}
          onClick={selectThisStudent}
          colorScheme="blue"
        >
          Message
        </Button>
      </Td>
    </Tr>
  );
};

export interface TableRowProps {
  students: Student[];
  selectStudent: SelectStudent;
  currentWeek: number;
}

export interface EmailViewElements {
  data: ApiResponse;
  currentWeek: number;
}

const TableRows: React.FC<TableRowProps> = (props) => {
  return (
    <>
      {Object.values(props.students).map((student) => (
        <TableAuthor
          key={student.id}
          student={student}
          selectStudent={props.selectStudent}
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
  selectStudent: SelectStudent;
  data: ApiResponse;
}

const EmailTable: React.FC<EmailTableProps> = (props) => {
  const [currentWeek, setCurrentWeek] = React.useState<number>(0);
  const { students, numWeeks } = useAuthors({
    data: props.data,
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
            students={students}
            selectStudent={props.selectStudent}
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
  currentStudent: Student | null;
  unselectStudent: () => void;
}

const useEditSubject = (currentStudent: Student | null) => {
  const [currentSubject, setCurrentSubject] = React.useState<string>(
    currentStudent?.issues[0]?.name || ""
  );
  const changeSubject = React.useCallback((event) => {
    setCurrentSubject(event.target.value);
  }, []);

  React.useEffect(() => {
    setCurrentSubject(currentStudent?.issues[0]?.name || "");
  }, [currentStudent]);

  return { currentSubject, changeSubject };
};

const useEditEmail = (currentStudent: Student | null) => {
  const [currentTemplate, setCurrentTemplate] = React.useState<string>(
    currentStudent?.issues?.map((issue) => issue.template)?.join("\n") || ""
  );
  const changeTemplate = React.useCallback((event) => {
    setCurrentTemplate(event.target.value);
  }, []);
  React.useEffect(() => {
    setCurrentTemplate(
      currentStudent?.issues?.map((issue) => issue.template)?.join("\n") || ""
    );
  }, [currentStudent]);
  return { currentTemplate, changeTemplate };
};

const EmailModal: React.FC<EmailModalProps> = (props) => {
  const { currentStudent, unselectStudent } = props;
  const { currentSubject, changeSubject } = useEditSubject(currentStudent);
  const { currentTemplate, changeTemplate } = useEditEmail(currentStudent);
  return (
    <Modal size="lg" isOpen={currentStudent !== null} onClose={unselectStudent}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          data-testid={`${currentStudent?.name?.replace(" ", "-")}-email-modal`}
        >
          Email {currentStudent?.email}
        </ModalHeader>
        <ModalCloseButton />
        <Flex flexDirection="column" width="100%" pb="16px" px="24px">
          <Flex py="16px" alignItems="center">
            <Text fontWeight="600" pr="16px">
              Subject
            </Text>
            <Input value={currentSubject} onChange={changeSubject} />
          </Flex>
          <Text fontWeight="600" py="16px">
            Body
          </Text>
          <Textarea value={currentTemplate} onChange={changeTemplate} />
          <Flex pt="16px">
            <Button colorScheme="teal">Send</Button>
          </Flex>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export interface EmailViewProps {
  data: ApiResponse;
}

const EmailsView: React.FC<EmailViewProps> = (props) => {
  const { currentStudent, selectStudent, unselectStudent } = useStudentModal();
  return (
    <Flex data-testid="emails-view" flexDirection="column" alignItems="center">
      <EmailTable selectStudent={selectStudent} data={props.data} />
      <EmailModal
        currentStudent={currentStudent}
        unselectStudent={unselectStudent}
      />
    </Flex>
  );
};

export default EmailsView;
