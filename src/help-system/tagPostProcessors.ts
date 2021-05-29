import { TagPostProcessor } from "./tagStructure";
import { getDoingFine } from "./utils";

export const aboveZeroProcessor: TagPostProcessor = ({ issues }) =>
  issues.filter((issue) => issue.weight > 0);

export const canRelaxProcessor: TagPostProcessor = ({ issues }) => {
  const doingFine = issues.find((issue) => issue.name === "can_relax");
  return doingFine ? [doingFine] : issues;
};

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
