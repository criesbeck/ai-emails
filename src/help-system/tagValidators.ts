import { TagValidator } from "./tagStructure";

export const sufficientValidator: TagValidator = ({ issues, history, ctx }) => {
  const importantIssues = issues.filter((issue) => issue.weight > 0);
  const newIssues =
    Object.values(history.exercises).length >= 30
      ? importantIssues.filter((issue) => issue.name === "can_relax")
      : importantIssues;
  return newIssues.length <= 0
    ? [{ ...ctx.templates.doing_fine, weight: 1 }]
    : newIssues;
};
