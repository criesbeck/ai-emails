import { Tag } from "./tagStructure";

export const submissionCount: Tag = {
  name: "Submission Count",
  template: `You did not submit three exercises this week.`,
  weight: 1,
  predicate: ({ student, ctx }) => {
    return true;
  },
};

export const exerciseDifficulty: Tag = {
  name: "Exercise Difficulty",
  template: `You should try more difficult exercises.`,
  weight: 1,
  predicate: ({ student, ctx }) => {
    return false;
  },
};
