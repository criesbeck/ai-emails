import { Author } from "./CriticStructure";
import {
  WebContext,
  Student,
  TagContext,
  Tag,
  TagFilterContext,
  StudentWithHistory,
} from "./tagStructure";
import { getCourseContext, getWeekBefore, isFirstWeek } from "./utils";
import * as tagReducers from "./tagReducers";
import * as tagValidators from "./tagValidators";

const reducers = Object.values(tagReducers);
const reduceTags = (ctx: TagContext) =>
  reducers.reduce((acc: Tag[], fn) => acc.concat(fn(ctx)), []);

const filters = Object.values(tagValidators);
const filterTags = (ctx: TagFilterContext) =>
  filters.reduce(
    (acc: Tag[], filter) =>
      filter({ issues: acc, ctx: ctx.ctx, history: ctx.history }),
    ctx.issues
  );

const getAuthors = (info: WebContext): Author[] =>
  Object.values(info.data.authors.authors);

const makeStudents = (context: WebContext): Student[] => {
  const ctx = getCourseContext(context);
  const makeStudent = (author: Author): Student => {
    const history = context.data.poke.authors[author.id];
    return { ...author, issues: reduceTags({ history, student: author, ctx }) };
  };
  const filterIssues = (student: Student): Student => {
    const history = context.data.poke.authors[student.id];
    const { issues } = student;
    return { ...student, issues: filterTags({ issues, history, ctx }) };
  };
  return getAuthors(context).map(makeStudent).map(filterIssues);
};

export interface StudentHelp {
  students: Student[];
  studentMap: Record<string, StudentWithHistory>;
}

const score = (student: Student): number =>
  student.issues.reduce((curScore, issue) => curScore + issue.weight, 0);

export const getInitialEmail = (student: Student): string =>
  student.issues.map((issue) => issue.template).join("\n");

const getStudentMap = (students: Student[]): Record<string, Student> =>
  students.reduce(
    (acc: Record<string, Student>, el) => ({ ...acc, [el.id]: el }),
    {}
  );

const getPreviousEmail = (info: WebContext, student: Student) => {
  if (isFirstWeek(info.data.submissions.submissions, info.currentTime))
    return null;
  return getInitialEmail(student);
};

export const orderStudents = (info: WebContext): StudentHelp => {
  const studentsThisWeek = makeStudents(info);
  const studentsLastWeek = makeStudents({
    ...info,
    currentTime: getWeekBefore(info.currentTime),
  });
  const lastWeekMap = getStudentMap(studentsLastWeek);
  const students = studentsThisWeek.sort((a, b) => score(b) - score(a));
  const studentMap = students.reduce(
    (acc, el) => ({
      ...acc,
      [el.id]: {
        ...el,
        previousEmail: getPreviousEmail(info, lastWeekMap[el.id]),
      },
    }),
    {}
  );
  return {
    students,
    studentMap,
  };
};
