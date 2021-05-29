/* eslint-disable import/first */

export const CONFIG = {
  EXERCISE_GOAL: 30,
  MINIMUM_AI_CHALLENGE_FINISHED: 4,
  WEEK_TO_STOP_WORKING: 8,
  SUBMISSION_GAP_SIZE: 4,
  EXERCISES_TO_COMPLETE_EACH_WEEK: 3,
  WEEK_TO_START_DROP_SUGGESTIONS: 4,
  WEEK_TO_STOP_DROP_SUGGESTIONS: 6,
  WEEK_TO_START_AI_CHALLENGE_PROBLEMS: 5,
  DECAYING_AVERAGE: 0.65,
  DECAYING_AVERAGE_ROUND: 2,
};

import dayjs from "dayjs";
import {
  AuthorSubmissionHistory,
  submissionId,
  Status,
  Submission,
  SubmissionHistory,
} from "./CriticStructure";
import {
  WebContext,
  CourseContext,
  Student,
  TagContext,
  TagProcessContext,
} from "./tagStructure";

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

export const countAiExercises = (tagContext: TagContext): number => {
  const finished = finishedSoFar(tagContext);
  return finished.filter((ex) => {
    return tagContext.ctx.aiExercises.has(ex.submit_hist[0].exid);
  }).length;
};

export const countChallengeExercises = (tagContext: TagContext): number => {
  const finished = finishedSoFar(tagContext);
  return finished.filter((ex) => {
    return tagContext.ctx.challengeExercises.has(ex.submit_hist[0].exid);
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

export const finishedSoFar = (ctx: TagContext | TagProcessContext) => {
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

export interface RelaxMeta {
  aiFinished: number;
  challengeFinished: number;
  currentlyFinished: number;
}

export const getRelaxMessage = ({
  currentlyFinished,
  challengeFinished,
  aiFinished,
}: RelaxMeta): string => {
  return `${currentlyFinished} : ${aiFinished + challengeFinished}`;
};

export const extractRelaxMeta = (
  ctx: TagContext | TagProcessContext
): RelaxMeta => {
  const currentlyFinished = finishedSoFar(ctx);
  const aiFinished = currentlyFinished.filter((x) => {
    const id = x.submit_hist[0].exid;
    return ctx.ctx.aiExercises.has(+id);
  });
  const challengeFinished = currentlyFinished.filter((x) => {
    const id = x.submit_hist[0].exid;
    return ctx.ctx.challengeExercises.has(+id);
  });
  return {
    aiFinished: aiFinished.length,
    challengeFinished: challengeFinished.length,
    currentlyFinished: currentlyFinished.length,
  };
};

export const decayingAverage = (nums: number[]): number =>
  nums.reduce(
    (acc: null | number, el) =>
      acc
        ? Number.parseFloat(
            (
              acc * (1 - CONFIG.DECAYING_AVERAGE) +
              el * CONFIG.DECAYING_AVERAGE
            ).toFixed(CONFIG.DECAYING_AVERAGE_ROUND)
          )
        : el,
    null
  ) || 0;

export const getDoingFine = (ctx: TagProcessContext) => {
  const meta = extractRelaxMeta(ctx);
  const message = getRelaxMessage(meta);
  return {
    ...ctx.ctx.templates.doing_fine,
    subject: `${ctx.ctx.templates.doing_fine.subject} ${message}`,
  };
};

export const partitionSubmissions = (ctx: TagContext): number[] =>
  buildWeekArray(getWeekMap(ctx), ctx.ctx.currentWeek);
