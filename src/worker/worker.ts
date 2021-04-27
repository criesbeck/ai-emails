import { orderStudents, Students, WebContext } from "../help-system";

export function processStudents(ctx: WebContext): Students {
  return orderStudents(ctx);
}
