import { TagReducer } from "./tagStructure";
import { isFinished } from "./utils";

export const exerciseCount: TagReducer = ({
  history,
  ctx: { currentTime, weekStartTime },
}) => {
  return {
    name: "Exercise Count",
    template: `You did not complete three exercises this week.`,
    weight: 1,
  };
};

export const needsMoreAi: TagReducer = () => {
  return {
    name: "Needs more AI",
    template: "You should work on more AI exercises.",
    weight: 1,
  };
};

export const needsMoreChallenge: TagReducer = () => {
  return {
    name: "Needs more challenge",
    template: "You should work on more challenge exercises.",
    weight: 1,
  };
};

export const considerDropping: TagReducer = () => {
  return {
    name: "Consider Dropping",
    template: "You should consider dropping the course.",
    weight: 1,
  };
};

export const needsEncouragement: TagReducer = () => {
  return {
    name: "Don't give up!",
    template: "Don't give up! Keep trying and learning! You can do it!",
    weight: 1,
  };
};
