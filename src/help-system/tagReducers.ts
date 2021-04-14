import { TagReducer } from "./tagStructure";

export const needsMoreAi: TagReducer = () => {
  return {
    name: "Needs more AI.",
    template: "You should work on more AI exercises.",
    weight: 1,
  };
};

export const submissionCount: TagReducer = () => {
  return {
    name: "Submission Count",
    template: `You did not submit three exercises this week.`,
    weight: 1,
  };
};
