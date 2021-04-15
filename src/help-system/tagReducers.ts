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

interface ReducerConfig {
  name: string;
  template: string;
  offset: number;
}

const generateCategoryReducer = (config: ReducerConfig): TagReducer => {
  const { offset, template, name } = config;
  const needsMore: TagReducer = ({ history, ctx }) => {
    return {
      name,
      template,
      weight:
        ctx.currentWeek < 5
          ? 0
          : ctx.currentWeek - offset - countAiExercises(history, ctx),
    };
  };
  return needsMore;
};

export const needsMoreAi = generateCategoryReducer({
  name: "AI Problems",
  template: "You should work on more AI exercises.",
  offset: 7,
});

export const needsMoreChallenge = generateCategoryReducer({
  name: "Challenge Problems",
  template: "You should work on more challenge exercises.",
  offset: 7,
});

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
