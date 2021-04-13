import dayjs from "dayjs";
import { Tag } from "./tagStructure";
import { getLatestSubmission } from "./utils";

export const needsMoreAI: Tag = {
  name: "Needs AI",
  template: "You should start working on AI problems.",
  weight: 1,
  predicate: ({ student, ctx }) => {
    const { currentTime } = ctx;
    if (currentTime < 5) return false;
    const latestSubmission = getLatestSubmission(
      ctx.data.submissions.submissions
    );
    const aiExerciseIds = new Set(ctx.data.submissions.ai);
    const myExercises = ctx.data.poke.authors[student.id].exercises;
    const exerciseIds = Object.keys(myExercises).map((el) =>
      Number.parseInt(el, 10)
    );
    const aiExercises = exerciseIds.filter((num) => {
      const status = myExercises[num]?.status || "Not done";
      const submitted = myExercises[num]?.submitted;
      const isAi = aiExerciseIds.has(num);
      const isDone = status === "Done" || status === "Well done!";
      const isFinishedNow =
        dayjs(latestSubmission).diff(submitted, "week") <= currentTime;
      return isAi && isDone && isFinishedNow;
    });
    return aiExercises.length < 4;
  },
};

export const submissionCount: Tag = {
  name: "Submission Count",
  template: `You did not submit three exercises this week.`,
  weight: 1,
  predicate: ({ student, ctx }) => {
    const latestSubmission = getLatestSubmission(
      ctx.data.submissions.submissions
    );
    const thisWeeksSubmissions = ctx.data.poke.authors[
      student.id
    ].submissions.filter(
      (submission) =>
        dayjs(latestSubmission).diff(submission.submitted, "week") ===
        ctx.currentTime
    );
    return thisWeeksSubmissions.length < 3;
  },
};
