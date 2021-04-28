import dayjs from "dayjs";
import {
  getFinishedExercises,
  countAiExercises,
  between,
  isFinished,
} from "./utils";
import { AuthorSubmissionHistory } from "./CriticStructure";
import { TagReducer, CourseContext } from "./tagStructure";

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
}

const generateCategoryReducer = (config: ReducerConfig): TagReducer => {
  const { offset, name } = config;
  const needsMore: TagReducer = ({ history, ctx }) => {
    return {
      ...ctx.templates[name],
      weight:
        ctx.currentWeek < 5
          ? 0
          : ctx.currentWeek - offset - countAiExercises(history, ctx),
    };
  };
  return needsMore;
};

export const needsMoreAi = generateCategoryReducer({
  name: "ai_problems",
  template: "You should work on more AI exercises.",
  offset: 7,
});

export const needsMoreChallenge = generateCategoryReducer({
  name: "challenge_problems",
  template: "You should work on more challenge exercises.",
  offset: 7,
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
