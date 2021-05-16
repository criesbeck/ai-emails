import dayjs from "dayjs";
import {
  getFinishedExercises,
  countAiExercises,
  countChallengeExercises,
  between,
  isFinished,
  finishedSoFar,
} from "./utils";
import { AuthorSubmissionHistory } from "./CriticStructure";
import {
  TagReducer,
  TagContext,
  CourseContext,
  WebContext,
} from "./tagStructure";

export const submissionGap: TagReducer = ({ ctx, history }) => {
  const finishedExercises = getFinishedExercises(history, ctx);
  const lastSubmission = history.submissions
    .filter((submission) => submission.submitted <= ctx.currentTime)
    .sort((a, b) => b.submitted - a.submitted)[0];
  const daysBetween = lastSubmission?.submitted
    ? dayjs(ctx.currentTime).diff(lastSubmission.submitted, "day")
    : Infinity;
  return {
    ...ctx.templates.submission_gap,
    weight: daysBetween >= 4 && finishedExercises.length < 30 ? 1 : 0,
  };
};

export const exerciseCount: TagReducer = ({ history, ctx }) => {
  const thisWeeksExercises = getFinishedExercises(history, ctx);
  return {
    ...ctx.templates.exercise_count,
    weight: 3 - thisWeeksExercises.length,
  };
};

interface ReducerConfig {
  name: string;
  template: string;
  offset: number;
  fn: (history: AuthorSubmissionHistory, ctx: CourseContext) => number;
}

const generateCategoryReducer = (config: ReducerConfig): TagReducer => {
  const { offset, name, fn } = config;
  const needsMore: TagReducer = ({ history, ctx }) => {
    const count = fn(history, ctx);
    return {
      ...ctx.templates[name],
      subject: `${ctx.templates[name].subject} ${count}`,
      weight: ctx.currentWeek < 5 ? 0 : offset - count,
    };
  };
  return needsMore;
};

export const needsMoreAi = generateCategoryReducer({
  name: "ai_problems",
  template: "You should work on more AI exercises.",
  offset: 7,
  fn: countAiExercises,
});

export const needsMoreChallenge = generateCategoryReducer({
  name: "challenge_problems",
  template: "You should work on more challenge exercises.",
  offset: 7,
  fn: countChallengeExercises,
});

const getDropWeight = (
  history: AuthorSubmissionHistory,
  ctx: CourseContext
): number => {
  if (!between(ctx.currentWeek, 4, 6)) return 0;
  return Object.values(history.exercises).filter((ex) => isFinished(ex.status))
    .length <= 3
    ? 5
    : 0;
};

export const considerDropping: TagReducer = ({ history, ctx }) => {
  const dropWeight = getDropWeight(history, ctx);
  return {
    ...ctx.templates.consider_dropping,
    weight: dropWeight,
  };
};

export const needsEncouragement: TagReducer = ({ ctx, history }) => {
  const unfinishedExercises = Object.values(history.exercises).filter(
    (ex) => !isFinished(ex.status)
  );
  const needsEncouragement = Boolean(
    unfinishedExercises.find((ex) => ex?.submit_hist?.length > 5)
  );
  return {
    ...ctx.templates.dont_give_up,
    weight: needsEncouragement ? 1 : 0,
  };
};

const studentCanRelax = (ctx: TagContext): boolean => {
  const currentlyFinished = finishedSoFar(ctx);
  if (currentlyFinished.length < 30) return false;
  const aiAndChallenge = currentlyFinished.filter((x) => {
    const id = x.submit_hist[0].exid;
    return ctx.ctx.aiExercises.has(id) || ctx.ctx.challengeExercises.has(id);
  });
  return aiAndChallenge.length >= 4 && ctx.ctx.currentWeek >= 8;
};

export const canRelax: TagReducer = (ctx) => {
  const canRelax = studentCanRelax(ctx);
  return {
    ...ctx.ctx.templates.can_relax,
    weight: canRelax ? 1 : 0,
  };
};
