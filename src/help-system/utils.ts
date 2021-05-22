import dayjs from "dayjs";
import {
  AuthorSubmissionHistory,
  submissionId,
  Status,
  Submission,
  SubmissionHistory,
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

const getTotalFinished = (ctx: TagContext) => {
  const { exercises } = ctx.history;
  const finishedExercises = Object.values(exercises).filter((ex) =>
    isFinished(ex.status)
  );
  return finishedExercises;
};

const getWeekMap = (ctx: TagContext): Record<number, number> => {
  const finishedExercises = getTotalFinished(ctx);
  const toWeekNumber = (s: SubmissionHistory): number => {
    return dayjs(ctx.ctx.currentTime).diff(s.submitted, "week");
  };
  const toWeekMap = (acc: Record<number, number>, el: number) => {
    return Number.isInteger(acc[el])
      ? { ...acc, [el]: acc[el] + 1 }
      : { ...acc, [el]: 1 };
  };
  const weekMap = finishedExercises.map(toWeekNumber).reduce(toWeekMap, {});
  return weekMap;
};

export const buildWeekArray = (
  weekMap: Record<number, number>,
  numWeeks: number
): number[] => {
  return Array.from({ length: numWeeks })
    .map((_, i) => i)
    .map((weekNum) => weekMap[weekNum + 1] || 0);
};

export const decayingAverage = (nums: number[]): number =>
  nums.reduce(
    (acc: null | number, el) =>
      acc ? Number.parseFloat((acc * 0.35 + el * 0.65).toFixed(2)) : el,
    null
  ) || 0;

export const getAiAndChallenged = (ctx: TagContext) => {
  const finishedExercises = finishedSoFar(ctx);
  const aiAndChallenge = finishedExercises.filter((x) => {
    const id = x.submit_hist[0].exid;
    return ctx.ctx.aiExercises.has(+id) || ctx.ctx.challengeExercises.has(+id);
  });
  return aiAndChallenge;
};

export const partitionSubmissions = (ctx: TagContext): number[] =>
  buildWeekArray(getWeekMap(ctx), ctx.ctx.currentWeek);
