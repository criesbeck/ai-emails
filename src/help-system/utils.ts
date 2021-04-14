import { submissionId, Submission } from "./CriticStructure";

type SubmissionRecord = Record<submissionId, Submission>;

export const getLatestSubmission = (submissionRecord: SubmissionRecord) => {
  const submissions = Object.values(submissionRecord);
  return submissions[submissions.length - 1].submitted;
};
