import React from "react";
import {
  Flex,
  Text,
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
  Checkbox,
} from "@chakra-ui/react";
import { ApiResponse } from "../help-system/CriticStructure";
import { Student } from "../help-system/tagStructure";
import { StudentHelp } from "../help-system/studentRanker";
import { Switch, Route, useLocation } from "wouter";
import { useLocalStorage } from "react-use";
import AlertError from "./AlertError";

const TableColumnHeaders = () => {
  return (
    <Tr>
      <Th>Name</Th>
      <Th>Issues</Th>
      <Th>Send Message</Th>
      <Th>Finished</Th>
    </Tr>
  );
};

interface StudentProps {
  student: Student;
}

const useSelectStudent = (student: Student) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocation] = useLocation();
  const selectThisStudent = React.useCallback(() => {
    setLocation(`/${student.id}`);
  }, [setLocation, student]);
  return selectThisStudent;
};

interface LocalStudentStorage {
  finished: boolean;
  message: string;
}

const DEFAULT_STORAGE = {
  finished: false,
  message: "",
};

const useStoredStudent = (student: Student) => {
  const [storage, setStorage] = useLocalStorage<LocalStudentStorage>(
    `${student.id}`,
    DEFAULT_STORAGE
  );
  const toggleFinished = React.useCallback(() => {
    const toSpread = { ...DEFAULT_STORAGE, ...storage };
    setStorage({ ...toSpread, finished: !storage?.finished });
  }, [setStorage, storage]);
  return { storage, toggleFinished };
};

const FinishedCheckbox: React.FC<StudentProps> = ({ student }) => {
  const { storage, toggleFinished } = useStoredStudent(student);
  return (
    <Checkbox
      isChecked={storage?.finished}
      onChange={toggleFinished}
      size="lg"
    />
  );
};

const TableAuthor: React.FC<StudentProps> = ({ student }) => {
  const selectThisStudent = useSelectStudent(student);
  return (
    <Tr>
      <Td>{student.name}</Td>
      <Td maxWidth="300px">
        {student.issues.map((issue) => {
          return (
            <Tag colorScheme="teal" key={issue.name} mr="8px" mb="8px">
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
      <Td>
        <FinishedCheckbox student={student} />
      </Td>
    </Tr>
  );
};

export interface EmailViewElements {
  data: ApiResponse;
  currentTime: number;
}

export interface TableProps {
  students: Student[];
}

const TableRows: React.FC<TableProps> = (props) => {
  return (
    <>
      {Object.values(props.students).map((student) => (
        <TableAuthor key={student.id} student={student} />
      ))}
    </>
  );
};

export interface EmailCoreProps {
  data: ApiResponse;
}

const EmailCoreTable: React.FC<TableProps> = ({ students }) => {
  return (
    <Table variant="simple" data-testid="email-core-table">
      <TableCaption>Students</TableCaption>
      <Thead>
        <TableColumnHeaders />
      </Thead>
      <Tbody>
        <TableRows students={students} />
      </Tbody>
      <Tfoot>
        <TableColumnHeaders />
      </Tfoot>
    </Table>
  );
};

const useGoHome = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocation] = useLocation();
  const goHome = React.useCallback(() => {
    setLocation("/");
  }, [setLocation]);
  return goHome;
};

const GotoOverview = () => {
  const goHome = useGoHome();
  return (
    <Button colorScheme="teal" data-testid="go-home" onClick={goHome}>
      Overview
    </Button>
  );
};

interface StudentMissingProps {
  id: string;
}

const StudentMissing: React.FC<StudentMissingProps> = ({ id }) => {
  return (
    <Flex
      data-testid="student-missing"
      p="24px"
      flexDirection="column"
      boxShadow="2px 2px 5px grey"
      maxWidth="300px"
    >
      <AlertError show message="404 - Student Missing" />
      <Text py="16px">
        We cannot find the student with an id of <strong>{id}</strong>. Please
        double check the URL and try again.
      </Text>
      <Flex>
        <GotoOverview />
      </Flex>
    </Flex>
  );
};

const EditStudentMessage: React.FC<StudentProps> = () => {
  return (
    <>
      <h1 data-testid="edit-student-message">Write me!</h1>
      <GotoOverview />
    </>
  );
};

const EmailCore: React.FC<StudentHelp> = (props) => {
  const { students, studentMap } = props;
  return (
    <Switch>
      <Route path="/:id">
        {(params) =>
          studentMap[params.id] ? (
            <EditStudentMessage student={studentMap[params.id]} />
          ) : (
            <StudentMissing id={params.id} />
          )
        }
      </Route>
      <Route>
        <EmailCoreTable students={students} />
      </Route>
    </Switch>
  );
};

export default EmailCore;
