import React from "react";
import {
  Flex,
  Heading,
  Text,
  Textarea,
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
import { Switch, Route, useLocation, useRouter } from "wouter";
import {
  ApiResponse,
  Student,
  Tag as TagType,
  StudentHelp,
  StudentWithHistory,
  getInitialEmail,
} from "../help-system";
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

interface EditStudentProps {
  student: StudentWithHistory;
}

const useSelectStudent = (student: Student) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocation] = useLocation();
  const selectThisStudent = React.useCallback(() => {
    setLocation(`/${student.id}`);
    // @ts-ignore
    router.lastLocation = window.scrollY;
  }, [setLocation, student, router]);
  return selectThisStudent;
};

interface LocalStudentStorage {
  finished: boolean;
  message: string;
}

const DEFAULT_STORAGE: LocalStudentStorage = {
  finished: false,
  message: "",
};
const useGoHome = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocation] = useLocation();
  const goHome = React.useCallback(() => {
    setLocation("/");
  }, [setLocation]);
  return goHome;
};

const useStoredStudent = (student: Student) => {
  const goHome = useGoHome();
  const [storage, setStorage] = useLocalStorage<LocalStudentStorage>(
    `${student.id}`,
    { finished: false, message: getInitialEmail(student) }
  );
  const toggleFinished = React.useCallback(() => {
    const toSpread = { ...DEFAULT_STORAGE, ...storage };
    setStorage({ ...toSpread, finished: !storage?.finished });
  }, [setStorage, storage]);
  const [message, setMessage] = React.useState<string>(
    storage?.message || getInitialEmail(student)
  );
  const editMessage: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    (event) => setMessage(event.target.value),
    [setMessage]
  );
  const saveMessage = React.useCallback(() => {
    setStorage({ finished: true, message: message });
    goHome();
  }, [message, setStorage, goHome]);
  return { storage, toggleFinished, message, editMessage, saveMessage };
};

const Divider = () => {
  return <Flex backgroundColor="black" mx="24px" width="1px" />;
};

const EditEmail: React.FC<EditStudentProps> = ({ student }) => {
  const { message, saveMessage, editMessage } = useStoredStudent(student);
  return (
    <Flex flexDirection="column" alignItems="center">
      <Heading size="lg" pb="10px">
        Message {student.name}
      </Heading>
      <Textarea
        minWidth="500px"
        minHeight="400px"
        value={message}
        onChange={editMessage}
      />
      <Flex py="10px">
        <Button onClick={saveMessage} colorScheme="blue">
          Save Draft
        </Button>
      </Flex>
      <Heading size="md" py="10px">
        Previous Message
      </Heading>
      <Textarea
        minWidth="500px"
        minHeight="400px"
        value={student.previousEmail}
        readOnly
      />
    </Flex>
  );
};

interface IssueFormProps {
  issue: TagType;
}

const useIssue = (issue: TagType) => {
  const [issueText, setIssueText] = React.useState<string>(issue.template);
  const changeIssue: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    (event) => {
      setIssueText(event.target.value);
    },
    [setIssueText]
  );
  return { issueText, changeIssue };
};

const IssueForm: React.FC<IssueFormProps> = ({ issue }) => {
  const { issueText, changeIssue } = useIssue(issue);
  return (
    <Flex flexDirection="column" maxWidth="200px" py="16px">
      <Text fontWeight="bold">{issue.name}</Text>
      <Textarea onChange={changeIssue} value={issueText} />
      <Flex pt="8px">
        <Button colorScheme="blue">Save Changes</Button>
      </Flex>
    </Flex>
  );
};

const EditTags: React.FC<StudentProps> = ({ student }) => {
  return (
    <Flex flexDirection="column">
      <Heading size="lg" pb="10px">
        Edit Issues
      </Heading>
      {student.issues.map((issue) => (
        <IssueForm key={issue.name} issue={issue} />
      ))}
    </Flex>
  );
};

const EditStudentMessage: React.FC<EditStudentProps> = ({ student }) => {
  return (
    <>
      <Flex
        data-testid="edit-student-message"
        p="24px"
        alignItems="center"
        flexDirection="column"
      >
        <Flex justifyContent="center">
          <GotoOverview />
        </Flex>
        <Flex py="16px">
          <EditEmail student={student} />
          <Divider />
          <EditTags student={student} />
        </Flex>
      </Flex>
    </>
  );
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

const useRememberScrollPosition = () => {
  const router = useRouter();
  React.useEffect(() => {
    // @ts-ignore
    if (!router.lastLocation) return;
    // @ts-ignore
    const lastLocation: number = router.lastLocation;
    window.scrollTo({ top: lastLocation });
  }, [router]);
};

const EmailCoreTable: React.FC<TableProps> = ({ students }) => {
  useRememberScrollPosition();
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

const GotoOverview = () => {
  const goHome = useGoHome();
  return (
    <Button colorScheme="teal" data-testid="go-home" onClick={goHome}>
      Back to Overview
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
      maxWidth="350px"
    >
      <AlertError show message="404 - Student Missing" />
      <Text py="16px">
        We cannot find the student with an id of <strong>{id}</strong>. Please
        double check the URL and try again.
      </Text>
      <Flex justifyContent="center">
        <GotoOverview />
      </Flex>
    </Flex>
  );
};

const EmailCore: React.FC<StudentHelp> = (props) => {
  const { students, studentMap } = props;
  return (
    <Switch>
      <Route path="/:id">
        {(params) => {
          return studentMap[params.id] ? (
            <EditStudentMessage student={studentMap[params.id]} />
          ) : (
            <StudentMissing id={params.id} />
          );
        }}
      </Route>
      <Route>
        <EmailCoreTable students={students} />
        <Button colorScheme="teal">Send all Emails</Button>
      </Route>
    </Switch>
  );
};

export default EmailCore;
