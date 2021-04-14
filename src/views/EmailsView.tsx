import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Text,
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
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import EmailsLoading from "./EmailsLoading";
import "react-datepicker/dist/react-datepicker.css";
/* import "./date-picker.css"; */

import { ApiResponse } from "../help-system/CriticStructure";
import { Student } from "../help-system/tagStructure";
import { getLatestSubmission } from "../help-system/utils";
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
            <Tag colorScheme="teal" key={issue.name} mr="8px">
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
  currentTime: number;
}

export interface EmailViewElements {
  data: ApiResponse;
  currentTime: number;
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

interface TimePickerProps {
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

const useChangeTime = (props: TimePickerProps) => {
  const { setCurrentTime } = props;
  const changeTime = React.useCallback(
    (date: Date | [Date, Date] | null, event) => {
      if (event.type !== "click") return;
      if (date === null) return;
      if (Array.isArray(date)) return setCurrentTime(date[0].getTime());
      return setCurrentTime(date.getTime());
    },
    [setCurrentTime]
  );
  return changeTime;
};

const TimePicker: React.FC<TimePickerProps> = (props) => {
  const { currentTime } = props;
  const changeTime = useChangeTime(props);
  return (
    <Flex width="200px" justifyContent="center" pb="16px" alignItems="center">
      <DatePicker
        value={dayjs(currentTime).format("DD/MM/YYYY")}
        customInput={
          <Flex flexDirection="column" alignItems="center">
            <Text fontWeight={600} pb="8px">
              {dayjs(currentTime).format("DD/MM/YYYY")}
            </Text>
            <Button colorScheme="teal">Change the Date</Button>
          </Flex>
        }
        selected={new Date(currentTime)}
        onChange={changeTime}
      />
    </Flex>
  );
};

export interface EmailTableProps {
  selectStudent: SelectStudent;
  data: ApiResponse;
}

const EmailTable: React.FC<EmailTableProps> = (props) => {
  const [currentTime, setCurrentTime] = React.useState<number>(
    getLatestSubmission(props.data.submissions.submissions)
  );
  const { loading, results } = useAuthors({
    data: props.data,
    currentTime,
  });
  if (loading) return <EmailsLoading />;
  const { students } = results;
  return (
    <>
      <TimePicker currentTime={currentTime} setCurrentTime={setCurrentTime} />
      <Table variant="simple">
        <TableCaption>Students</TableCaption>
        <Thead>
          <TableColumnHeaders />
        </Thead>
        <Tbody>
          <TableRows
            currentTime={currentTime}
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
