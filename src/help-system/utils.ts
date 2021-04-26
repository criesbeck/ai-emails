import dayjs from "dayjs";
import {
  AuthorSubmissionHistory,
  submissionId,
  Status,
  Submission,
} from "./CriticStructure";
import { WebContext, CourseContext } from "./tagStructure";

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

export const getCourseContext = (webContext: WebContext): CourseContext => {
  return {
    currentTime: webContext.currentTime,
    aiExercises: getAiExercises(webContext),
    challengeExercises: getChallengeExercises(webContext),
    currentWeek: getCurrentWeek(webContext),
    weekStartTime: getWeekStart(webContext),
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
