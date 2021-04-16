import { orderStudents, StudentHelp } from "../help-system/studentRanker";
import { WebContext } from "../help-system/tagStructure";

export function processStudents(ctx: WebContext): StudentHelp {
  return orderStudents(ctx);
}
