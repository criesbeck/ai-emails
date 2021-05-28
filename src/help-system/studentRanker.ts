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
  scoreStudent,
  getStudentMap,
  emailedThisWeek,
} from "./utils";
import * as tagReducers from "./tagReducers";
import * as tagPostProcessors from "./tagPostProcessors";

const reducers = Object.values(tagReducers);
const reduceTags = (ctx: TagContext) =>
  reducers.reduce((acc: Tag[], fn) => acc.concat(fn(ctx)), []);

const filters = Object.values(tagPostProcessors);
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

const getPreviousEmail = (
  info: WebContext,
  student: Student
): string | null => {
  const studentHistory = info.data.emailHistory[student.id];
  return studentHistory ? studentHistory[0].message : null;
};

interface SortedStudents {
  students: Student[];
}

const getSortedStudents = (info: WebContext): SortedStudents => {
  const studentsThisWeek = makeStudents(info);
  const studentsLastWeek = makeStudents({
    ...info,
    currentTime: getWeekBefore(info.currentTime),
  });
  const lastWeekMap = getStudentMap(studentsLastWeek);
  const sortedStudents = studentsThisWeek.sort(
    (a, b) => scoreStudent(b) - scoreStudent(a)
  );
  return {
    students: sortedStudents.map((student) => ({
      ...student,
      previousEmail: getPreviousEmail(info, lastWeekMap[student.id]),
    })),
  };
};

const separateByEmail = (
  { students: sortedStudents }: SortedStudents,
  info: WebContext
): Students => {
  return sortedStudents.reduce(
    (acc: Students, aStudent: Student) => {
      return emailedThisWeek(aStudent, info)
        ? {
            ...acc,
            emailedStudents: [...acc.emailedStudents, aStudent],
          }
        : {
            ...acc,
            students: [...acc.students, aStudent],
          };
    },
    { students: [], emailedStudents: [] }
  );
};

export const orderStudents = (info: WebContext): Students => {
  const sortedStudents = getSortedStudents(info);
  return separateByEmail(sortedStudents, info);
};
