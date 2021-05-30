/* eslint-disable import/first */

export const CONFIG = {
  // A student should try to complete this many exercises during the quarter.
  EXERCISE_GOAL: 30,
  // A student should try to finish this many exercises per week.
  EXERCISES_TO_COMPLETE_EACH_WEEK: 3,
  // A student should try to complete this many AI and challenge exercises.
  MINIMUM_AI_CHALLENGE_FINISHED: 4,
  // If a student has completed EXERCISE_GOAL exercises and MINIMUM_AI_CHALLENGE_FINISHED
  // exercises, they can relax at this week of the quarter.
  WEEK_TO_STOP_WORKING: 8,
  // If a student does not submit anything in SUBMISSION_GAP_SIZE days, there is a problem.
  SUBMISSION_GAP_SIZE: 4,
  // If a student has done very little work at WEEK_TO_START_DROP_SUGGESTIONS, we should
  // suggest that they drop the course, as they will probably fail.
  WEEK_TO_START_DROP_SUGGESTIONS: 4,
  // After WEEK_TO_STOP_DROP_SUGGESTIONS, we no longer suggest dropping because the drop
  // dealine has passed.
  WEEK_TO_STOP_DROP_SUGGESTIONS: 6,
  // At WEEK_TO_START_AI_CHALLENGE_PROBLEMS, we start to consider it a problem if a student
  // has not completed a sufficient number of exercises.
  WEEK_TO_START_AI_CHALLENGE_PROBLEMS: 5,
  // Use DECAYING_AVERAGE_PERCENTAGE_PERCENTAGE to weight the most recent exercises at each step
  // of the decaying average calculation.
  DECAYING_AVERAGE_PERCENTAGE: 0.65,
  // At each step of the decaying average calculation, round to
  // n decimal places.
  DECAYING_AVERAGE_PERCENTAGE_ROUND: 2,
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

export const countAiExercises = (
  tagContext: TagContext | TagProcessContext
): number => {
  const finished = finishedSoFar(tagContext);
  return finished.filter((ex) => {
    return tagContext.ctx.aiExercises.has(ex.submit_hist[0].exid);
  }).length;
};

export const countChallengeExercises = (
  tagContext: TagContext | TagProcessContext
): number => {
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
  return {
    aiFinished: countAiExercises(ctx),
    challengeFinished: countChallengeExercises(ctx),
    currentlyFinished: currentlyFinished.length,
  };
};

export const decayingAverage = (nums: number[]): number =>
  nums.reduce(
    (acc: null | number, el) =>
      acc
        ? Number.parseFloat(
            (
              acc * (1 - CONFIG.DECAYING_AVERAGE_PERCENTAGE) +
              el * CONFIG.DECAYING_AVERAGE_PERCENTAGE
            ).toFixed(CONFIG.DECAYING_AVERAGE_PERCENTAGE_ROUND)
          )
        : el,
    null
  ) || 0;

export const makeDoingFineTag = (ctx: TagProcessContext) => {
  const meta = extractRelaxMeta(ctx);
  const message = getRelaxMessage(meta);
  return {
    ...ctx.ctx.templates.doing_fine,
    subject: `${ctx.ctx.templates.doing_fine.subject} ${message}`,
    weight: 1,
  };
};

export const isOnTrack = (ctx: TagProcessContext) => {
  if (ctx.issues[0].name === "can_relax") return false;
  const { currentWeek } = ctx.ctx;
  const finished = finishedSoFar(ctx).length;
  return (
    finished >=
      Math.min(
        CONFIG.EXERCISES_TO_COMPLETE_EACH_WEEK * currentWeek,
        CONFIG.EXERCISE_GOAL
      ) || ctx.issues.length === 0
  );
};

export const studentCanRelax = (
  ctx: TagContext | TagProcessContext
): [boolean, string] => {
  const meta = extractRelaxMeta(ctx);
  const message = getRelaxMessage(meta);
  const { currentlyFinished, aiFinished, challengeFinished } = meta;
  if (currentlyFinished < CONFIG.EXERCISE_GOAL) return [false, message];
  return [
    aiFinished + challengeFinished >= CONFIG.SUBMISSION_GAP_SIZE &&
      ctx.ctx.currentWeek >= CONFIG.WEEK_TO_STOP_WORKING,
    message,
  ];
};

export const makeRelaxTag = (ctx: TagProcessContext, message: string) => ({
  ...ctx.ctx.templates.can_relax,
  subject: `${ctx.ctx.templates.can_relax.subject} ${message}`,
  weight: 1,
});

export const partitionSubmissions = (ctx: TagContext): number[] =>
  buildWeekArray(getWeekMap(ctx), ctx.ctx.currentWeek);
