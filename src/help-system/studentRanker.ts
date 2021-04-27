import { Author } from "./CriticStructure";
import {
  WebContext,
  Student,
  TagContext,
  Tag,
  TagFilterContext,
  Students,
} from "./tagStructure";
import {
  getCourseContext,
  getWeekBefore,
  isFirstWeek,
  scoreStudent,
  getInitialEmail,
  getStudentMap,
} from "./utils";
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
    return {
      ...author,
      previousEmail: null,
      issues: reduceTags({ history, student: author, ctx }),
    };
  };
  const filterIssues = (student: Student): Student => {
    const history = context.data.poke.authors[student.id];
    const { issues } = student;
    return { ...student, issues: filterTags({ issues, history, ctx }) };
  };
  return getAuthors(context).map(makeStudent).map(filterIssues);
};

const getPreviousEmail = (info: WebContext, student: Student) => {
  if (isFirstWeek(info.data.submissions.submissions, info.currentTime))
    return null;
  return getInitialEmail(student);
};

export const orderStudents = (info: WebContext): Students => {
  const studentsThisWeek = makeStudents(info);
  const studentsLastWeek = makeStudents({
    ...info,
    currentTime: getWeekBefore(info.currentTime),
  });
  const lastWeekMap = getStudentMap(studentsLastWeek);
  const students = studentsThisWeek.sort(
    (a, b) => scoreStudent(b) - scoreStudent(a)
  );
  return {
    students: students.map((student) => ({
      ...student,
      previousEmail: getPreviousEmail(info, lastWeekMap[student.id]),
    })),
  };
};
