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
import {
  ApiResponse,
  Student,
  Tag as TagType,
  Students,
  getStudentMap,
} from "../help-system";
import { Route, Switch, useHistory } from "react-router-dom";
import AlertError from "./AlertError";
import {
  StudentContext,
  useStudent,
  useStudents,
  useGoHome,
  useGotoConfirmation,
  useLocalStudents,
} from "./useStudents";
import EmailConfirmation from "./EmailConfirmation";

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

const useSelectStudent = ({ id }: Student) => {
  const history = useHistory();
  const selectThisStudent = React.useCallback(() => {
    history.push(`/${id}`);
  }, [history, id]);
  return selectThisStudent;
};

const Divider = () => {
  return <Flex backgroundColor="black" mx="24px" width="1px" />;
};

interface PreviousEmailProps {
  previousEmail: string | null;
}

const PreviousEmail: React.FC<PreviousEmailProps> = ({ previousEmail }) => {
  if (previousEmail === null || previousEmail === "") return null;
  return (
    <>
      <Heading size="md" py="10px">
        Previous Message
      </Heading>
      <Textarea
        minWidth="500px"
        minHeight="400px"
        value={previousEmail}
        readOnly
      />
    </>
  );
};

const EditEmail: React.FC<StudentProps> = ({ student }) => {
  const { message, saveMessage, editMessage } = useStudent(student);
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
      <PreviousEmail previousEmail={student.previousEmail} />
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

const EditStudentMessage: React.FC<StudentProps> = ({ student }) => {
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
  const { storage, toggleFinished } = useStudent(student);
  return (
    <Checkbox
      data-testid={`${student.name.replace(" ", "-")}-checkbox`}
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

const EmailButton = () => {
  const { storedStudents } = useStudents();
  const gotoConfirmation = useGotoConfirmation();
  return (
    <Button
      data-testid="goto-confirm-emails"
      onClick={gotoConfirmation}
      isDisabled={Object.values(storedStudents).some(
        (student) => !student.finished
      )}
      colorScheme="teal"
    >
      Send all Emails
    </Button>
  );
};

const EmailCore: React.FC<Students> = (props) => {
  const { students } = props;
  const studentMap = React.useMemo(() => getStudentMap(students), [students]);
  const value = useLocalStudents(props);
  return (
    <StudentContext.Provider value={value}>
      <Switch>
        <Route path="/confirm" exact component={EmailConfirmation} />
        <Route
          path="/:id"
          exact
          render={({ match }) => {
            return studentMap[match.params.id] ? (
              <EditStudentMessage student={studentMap[match.params.id]} />
            ) : (
              <StudentMissing id={match.params.id} />
            );
          }}
        ></Route>
        <Route>
          <EmailCoreTable students={students} />
          <EmailButton />
        </Route>
      </Switch>
    </StudentContext.Provider>
  );
};

export default EmailCore;
