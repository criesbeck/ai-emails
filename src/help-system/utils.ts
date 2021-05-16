import dayjs from "dayjs";
import {
  AuthorSubmissionHistory,
  submissionId,
  Status,
  Submission,
} from "./CriticStructure";
import { WebContext, CourseContext, Student, TagContext } from "./tagStructure";

type SubmissionRecord = Record<submissionId, Submission>;

export const isFinished = (status: Status) =>
  status === "Done" || status === "Well done!";

export const getEarliestSubmission = (submissionRecord: SubmissionRecord) =>
  Math.min(...Object.values(submissionRecord).map((sub) => sub.submitted));

export const getLatestSubmission = (submissionRecord: SubmissionRecord) =>
  Math.max(...Object.values(submissionRecord).map((sub) => sub.submitted));

export const isFirstWeek = (
  submissions: SubmissionRecord,
  time: number
): boolean => {
  return dayjs(time).diff(getEarliestSubmission(submissions), "week") <= 0;
};

const getCurrentWeek = (webContext: WebContext): number => {
  return dayjs(webContext.currentTime).diff(
    getEarliestSubmission(webContext.data.submissions.submissions),
    "week"
  );
};

export const getWeekBefore = (time: number): number =>
  dayjs(time).subtract(1, "week").toDate().getTime();

const getWeekStart = (webContext: WebContext): number =>
  dayjs(webContext.currentTime).startOf("week").toDate().getTime();

export const between = (
  n: number,
  smaller: number,
  bigger: number
): boolean => {
  return n >= smaller && n <= bigger;
};

const getAiExercises = (webContext: WebContext) =>
  new Set(webContext.data.submissions.ai);

const getChallengeExercises = (webContext: WebContext) =>
  new Set(webContext.data.submissions.challenge);

export const countAiExercises = (
  history: AuthorSubmissionHistory,
  ctx: CourseContext
): number => {
  const thisWeeksExercises = getFinishedExercises(history, ctx);
  return thisWeeksExercises.filter((ex) => {
    return ctx.aiExercises.has(ex.submit_hist[0].exid);
  }).length;
};

export const countChallengeExercises = (
  history: AuthorSubmissionHistory,
  ctx: CourseContext
): number => {
  const thisWeeksExercises = getFinishedExercises(history, ctx);
  return thisWeeksExercises.filter((ex) => {
    return ctx.challengeExercises.has(ex.submit_hist[0].exid);
  }).length;
};

export const getCourseContext = (webContext: WebContext): CourseContext => {
  return {
    currentTime: webContext.currentTime,
    aiExercises: getAiExercises(webContext),
    challengeExercises: getChallengeExercises(webContext),
    currentWeek: getCurrentWeek(webContext),
    weekStartTime: getWeekStart(webContext),
    templates: webContext.data.templates,
  };
};

export const getFinishedExercises = (
  history: AuthorSubmissionHistory,
  { weekStartTime, currentTime }: CourseContext
) => {
  return Object.values(history.exercises).filter(
    (exercise) =>
      between(exercise.submitted, weekStartTime, currentTime) &&
      isFinished(exercise.status)
  );
};

export const scoreStudent = (student: Student): number =>
  student.issues.reduce((curScore, issue) => curScore + issue.weight, 0);

export const getInitialEmail = (student: Student): string => {
  const submissionGap = student.issues.find(
    (issue) => issue.name === "submission_gap"
  );
  return submissionGap
    ? submissionGap.template
    : student.issues.map((issue) => issue.template).join("\n");
};

export const getStudentMap = (students: Student[]): Record<string, Student> =>
  students.reduce(
    (acc: Record<string, Student>, el) => ({ ...acc, [el.id]: el }),
    {}
  );

export const emailedThisWeek = (
  student: Student,
  info: WebContext
): boolean => {
  const emailHist = info.data.emailHistory[student.id];
  if (!emailHist) return false;
  const lastEmail = emailHist[0];
  return dayjs(Date.now()).diff(lastEmail.submissionTime, "week") < 1;
};

export const finishedSoFar = (ctx: TagContext) => {
  const {
    history: { exercises },
  } = ctx;
  return Object.values(exercises).filter((ex) => {
    return ex.submitted <= ctx.ctx.currentTime && isFinished(ex.status);
  });
};
