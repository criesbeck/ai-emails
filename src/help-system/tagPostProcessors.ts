import { TagPostProcessor } from "./tagStructure";
import { getDoingFine } from "./utils";

export const aboveZeroProcessor: TagPostProcessor = (globalCtx) =>
  globalCtx.issues.filter((issue) => issue.weight > 0);

export const doingFineProcessor: TagPostProcessor = (globalCtx) => {
  const { issues, history } = globalCtx;
  const newIssues =
    Object.values(history.exercises).length >= 30
      ? issues.filter((issue) => issue.name === "can_relax")
      : issues;
  return newIssues.length === 0
    ? [{ ...getDoingFine(globalCtx), weight: 1 }]
    : newIssues;
};
