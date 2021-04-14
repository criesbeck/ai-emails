import { orderStudents, StudentHelp } from "../help-system/studentRanker";
import { CourseContext } from "../help-system/tagStructure";

export function processStudents(ctx: CourseContext): StudentHelp {
  return orderStudents(ctx);
}
