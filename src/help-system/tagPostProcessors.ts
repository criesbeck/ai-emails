import { TagValidator } from "./tagStructure";
import { getDoingFine } from "./utils";

export const sufficientValidator: TagValidator = (globalCtx) => {
  const { issues, history } = globalCtx;
  const importantIssues = issues.filter((issue) => issue.weight > 0);
  const newIssues =
    Object.values(history.exercises).length >= 30
      ? importantIssues.filter((issue) => issue.name === "can_relax")
      : importantIssues;
  return newIssues.length === 0
    ? [{ ...getDoingFine(globalCtx), weight: 1 }]
    : newIssues;
};
