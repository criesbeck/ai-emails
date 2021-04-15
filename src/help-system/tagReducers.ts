import { getFinishedExercises, countAiExercises } from "./utils";
import { TagReducer } from "./tagStructure";

export const exerciseCount: TagReducer = ({ history, ctx }) => {
  const thisWeeksExercises = getFinishedExercises(history, ctx);
  return {
    name: "Exercise Count",
    template: `You did not complete three exercises this week.`,
    weight: 3 - thisWeeksExercises.length,
  };
};

export const needsMoreAi: TagReducer = ({ history, ctx }) => {
  const AI_REQUIRED_OFFSET = 7;
  return {
    name: "AI Problems",
    template: "You should work on more AI exercises.",
    weight:
      ctx.currentWeek < 5
        ? 0
        : ctx.currentWeek - AI_REQUIRED_OFFSET - countAiExercises(history, ctx),
  };
};

export const needsMoreChallenge: TagReducer = () => {
  const CHALLENGE_REQUIRED_OFFSET = 6;
  return {
    name: "Needs more challenge",
    template: "You should work on more challenge exercises.",
    weight: 0,
  };
};

export const considerDropping: TagReducer = () => {
  return {
    name: "Consider Dropping",
    template: "You should consider dropping the course.",
    weight: 0,
  };
};

export const needsEncouragement: TagReducer = () => {
  return {
    name: "Don't give up!",
    template: "Don't give up! Keep trying and learning! You can do it!",
    weight: 0,
  };
};
