import { orderStudents, StudentHelp, WebContext } from "../help-system";

export function processStudents(ctx: WebContext): StudentHelp {
  return orderStudents(ctx);
}
