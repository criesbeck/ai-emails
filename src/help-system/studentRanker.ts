import dayjs from "dayjs";
import { Author } from "./CriticStructure";
import { CourseContext, Tag, Student } from "./tagStructure";
import * as tagElements from "./tags";

const tags: Tag[] = Object.values(tagElements);

const getAuthors = (info: CourseContext): Author[] =>
  Object.values(info.data.authors.authors);

const countWeeks = (info: CourseContext): number => {
  const submissionList = Object.values(info.data.submissions.submissions);
  const [firstSubmission, lastSubmission] = [
    submissionList[0],
    submissionList[submissionList.length - 1],
  ];
  return dayjs(lastSubmission.submitted).diff(
    firstSubmission.submitted,
    "week"
  );
};

const makeStudents = (ctx: CourseContext): Student[] => {
  const makeStudent = (author: Author): Student => {
    const student: Student = { ...author, issues: [] };
    tags.forEach((tag) => {
      if (!tag.predicate({ student, ctx })) return;
      student.issues.push({
        name: tag.name,
        weight: tag.weight,
        template: tag.template,
      });
    });
    return student;
  };
  return getAuthors(ctx).map(makeStudent);
};

export interface StudentHelp {
  numWeeks: number;
  students: Student[];
}

const score = (student: Student): number =>
  student.issues.reduce((curScore, issue) => curScore + issue.weight, 0);

export const orderStudents = (info: CourseContext): StudentHelp => ({
  numWeeks: countWeeks(info),
  students: makeStudents(info).sort((a, b) => score(b) - score(a)),
});
