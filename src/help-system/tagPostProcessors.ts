import { TagPostProcessor } from "./tagStructure";
import {
  makeDoingFineTag,
  isOnTrack,
  studentCanRelax,
  makeRelaxTag,
} from "./utils";

export const aboveZero: TagPostProcessor = ({ issues }) =>
  issues.filter((issue) => issue.weight > 0);

export const handleFinishedStudents: TagPostProcessor = (ctx) => {
  const [canRelax, message] = studentCanRelax(ctx);
  if (canRelax) return [makeRelaxTag(ctx, message)];
  if (isOnTrack(ctx)) return [makeDoingFineTag(ctx)];
  return ctx.issues;
};
