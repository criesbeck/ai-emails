import dayjs from "dayjs";
import { Tag, CourseContext } from "./tagStructure";

const getLatestSubmission = (ctx: CourseContext) => {
  const submissions = Object.values(ctx.data.submissions.submissions);
  return submissions[submissions.length - 1].submitted;
};

export const submissionCount: Tag = {
  name: "Submission Count",
  template: `You did not submit three exercises this week.`,
  weight: 1,
  predicate: ({ student, ctx }) => {
    const latestSubmission = getLatestSubmission(ctx);
    const thisWeeksSubmissions = ctx.data.poke.authors[
      student.id
    ].submissions.filter(
      (submission) =>
        dayjs(latestSubmission).diff(submission.submitted, "week") ===
        ctx.currentWeek
    );
    return thisWeeksSubmissions.length < 3;
  },
};
