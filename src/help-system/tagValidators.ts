import { TagValidator } from "./tagStructure";

export const enoughExercises: TagValidator = ({ issues, history }) =>
  Object.values(history.exercises).length >= 30 ? [] : issues;

export const weightValidator: TagValidator = ({ issues }) =>
  issues.filter((issue) => issue.weight > 0);
