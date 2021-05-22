import dayjs from "dayjs";
import {
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
    weight: daysBetween >= 4 && finishedExercises.length < 30 ? daysBetween : 0,
  };
};

export const exerciseCount: TagReducer = ({ history, ctx }) => {
  const thisWeeksExercises = getFinishedExercises(history, ctx);
  return {
    ...ctx.templates.exercise_count,
    subject: `${ctx.templates.exercise_count.subject} ${thisWeeksExercises.length} / 3`,
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

export const studentVelocity: TagReducer = (ctx) => {
  const weeklyAverage = decayingAverage(partitionSubmissions(ctx));
  return {
    ...ctx.ctx.templates.exercise_velocity,
    subject: `${
      ctx.ctx.templates.exercise_velocity.subject
    } ${weeklyAverage.toFixed(2)}`,
    weight: weeklyAverage < 1 ? 3 + weeklyAverage : 0,
  };
};

const studentCanRelax = (ctx: TagContext): [boolean, string] => {
  const meta = extractRelaxMeta(ctx);
  const message = getRelaxMessage(meta);
  const { currentlyFinished, aiFinished, challengeFinished } = meta;
  if (currentlyFinished < 30) return [false, message];
  return [
    aiFinished + challengeFinished >= 4 && ctx.ctx.currentWeek >= 8,
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
