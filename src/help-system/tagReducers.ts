import dayjs from "dayjs";
import {
  CONFIG,
  getFinishedExercises,
  countAiExercises,
  countChallengeExercises,
  between,
  isFinished,
  extractRelaxMeta,
  partitionSubmissions,
  decayingAverage,
  getRelaxMessage,
} from "./utils";
import { AuthorSubmissionHistory } from "./CriticStructure";
import { TagReducer, TagContext, CourseContext } from "./tagStructure";

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
    subject: `${ctx.templates.submission_gap.subject} ${daysBetween}`,
    weight:
      daysBetween >= CONFIG.SUBMISSION_GAP_SIZE &&
      finishedExercises.length < CONFIG.EXERCISE_GOAL
        ? daysBetween
        : 0,
  };
};

export const exerciseCount: TagReducer = ({ history, ctx }) => {
  const thisWeeksExercises = getFinishedExercises(history, ctx);
  return {
    ...ctx.templates.exercise_count,
    subject: `${ctx.templates.exercise_count.subject} ${thisWeeksExercises.length} / ${CONFIG.EXERCISES_TO_COMPLETE_EACH_WEEK}`,
    weight: CONFIG.EXERCISES_TO_COMPLETE_EACH_WEEK - thisWeeksExercises.length,
  };
};

interface ReducerConfig {
  name: string;
  template: string;
  fn: (ctx: TagContext) => number;
}

const getCategoryWeight = (week: number, finished: number) => {
  if (week < CONFIG.WEEK_TO_START_AI_CHALLENGE_PROBLEMS) return 0;
  return CONFIG.MINIMUM_AI_CHALLENGE_FINISHED - finished;
};

const generateCategoryReducer = (config: ReducerConfig): TagReducer => {
  const { name, fn } = config;
  const needsMore: TagReducer = (ctx) => {
    const count = fn(ctx);
    return {
      ...ctx.ctx.templates[name],
      subject: `${ctx.ctx.templates[name].subject} ${count}`,
      weight: getCategoryWeight(ctx.ctx.currentWeek, count),
    };
  };
  return needsMore;
};

export const needsMoreAi = generateCategoryReducer({
  name: "ai_problems",
  template: "You should work on more AI exercises.",
  fn: countAiExercises,
});

export const needsMoreChallenge = generateCategoryReducer({
  name: "challenge_problems",
  template: "You should work on more challenge exercises.",
  fn: countChallengeExercises,
});

const getDropWeight = (
  history: AuthorSubmissionHistory,
  ctx: CourseContext
): number => {
  if (
    !between(
      ctx.currentWeek,
      CONFIG.WEEK_TO_START_DROP_SUGGESTIONS,
      CONFIG.WEEK_TO_STOP_DROP_SUGGESTIONS
    )
  )
    return 0;
  return Object.values(history.exercises).filter((ex) => isFinished(ex.status))
    .length <= CONFIG.EXERCISES_TO_COMPLETE_EACH_WEEK
    ? 1
    : 0;
};

export const considerDropping: TagReducer = ({ history, ctx }) => {
  const dropWeight = getDropWeight(history, ctx);
  return {
    ...ctx.templates.consider_dropping,
    weight: dropWeight,
  };
};

export const studentVelocity: TagReducer = (ctx) => {
  const weeklyAverage = decayingAverage(partitionSubmissions(ctx));
  return {
    ...ctx.ctx.templates.exercise_velocity,
    subject: `${
      ctx.ctx.templates.exercise_velocity.subject
    } ${weeklyAverage.toFixed(CONFIG.DECAYING_AVERAGE_ROUND)}`,
    weight:
      weeklyAverage < 1
        ? CONFIG.EXERCISES_TO_COMPLETE_EACH_WEEK + weeklyAverage
        : 0,
  };
};

const studentCanRelax = (ctx: TagContext): [boolean, string] => {
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

export const canRelax: TagReducer = (ctx) => {
  const [canRelax, relaxMessage] = studentCanRelax(ctx);
  return {
    ...ctx.ctx.templates.can_relax,
    subject: `${ctx.ctx.templates.can_relax.subject} ${relaxMessage}`,
    weight: canRelax ? 1 : 0,
  };
};
