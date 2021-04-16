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

const getSortedSubmissions = (submissionRecord: SubmissionRecord) =>
  Object.values(submissionRecord).sort((a, b) => a.submitted - b.submitted);

export const getEarliestSubmission = (submissionRecord: SubmissionRecord) =>
  getSortedSubmissions(submissionRecord)[0].submitted;

export const getLatestSubmission = (submissionRecord: SubmissionRecord) => {
  const submissions = getSortedSubmissions(submissionRecord);
  return submissions[submissions.length - 1].submitted;
};

const getCurrentWeek = (webContext: WebContext): number => {
  return dayjs(webContext.currentTime).diff(
    getEarliestSubmission(webContext.data.submissions.submissions),
    "week"
  );
};
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
