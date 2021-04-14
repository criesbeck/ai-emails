import { Author } from "./CriticStructure";
import { WebContext, Student, TagReducer } from "./tagStructure";
import * as tagReducers from "./tagReducers";

const reducers: TagReducer[] = Object.values(tagReducers);

const getAuthors = (info: WebContext): Author[] =>
  Object.values(info.data.authors.authors);

const makeStudents = (context: WebContext): Student[] => {
  const ctx = { currentTime: context.currentTime };
  const makeStudents = (author: Author): Student => ({
    ...author,
    issues: reducers.map((reducer) => {
      const history = context.data.poke.authors[author.id];
      return reducer({ history, student: author, ctx });
    }),
  });
  return getAuthors(context).map(makeStudents);
};

export interface StudentHelp {
  students: Student[];
}

const score = (student: Student): number =>
  student.issues.reduce((curScore, issue) => curScore + issue.weight, 0);

export const orderStudents = (info: WebContext): StudentHelp => ({
  students: makeStudents(info).sort((a, b) => score(b) - score(a)),
});
