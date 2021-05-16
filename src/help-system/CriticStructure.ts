export type Status =
  | "Not done"
  | "Almost done"
  | "Done"
  | "Well done!"
  | "Terminated";

export type authorId = number;

export type exerciseId = number;

export type submissionId = number;

export type completionTime = number;

export type exerciseName = string;

export type SubmissionRecord = Record<submissionId, Submission>;

export interface Author {
  name: string;
  email: string;
  id: authorId;
}

export type Authors = Record<string, Author>;

export interface Submission {
  author: authorId;
  submitted: completionTime;
  exid: exerciseId;
  status: Status;
}

export interface Submissions {
  exercises: Record<exerciseId, exerciseName>;
  ai: exerciseId[];
  challenge: exerciseId[];
  submissions: SubmissionRecord;
}

export interface SubmissionHistory {
  status: Status;
  submit_hist: Submission[];
  submitted: completionTime;
}

export interface AuthorSubmissionHistory {
  exercises: Record<exerciseId, SubmissionHistory>;
  submissions: Submission[];
}

export interface AuthorHistory {
  authors: Record<authorId, AuthorSubmissionHistory>;
}

export type Templates = Record<string, TemplateResponse>;

interface EmailRecord {
  id: authorId;
  email: string;
  message: string;
  issues: string[];
  submissionTime: number;
}

export type EmailHistory = Record<authorId, EmailRecord[]>;

export interface ApiResponse {
  authors: {
    authors: Record<authorId, Author>;
  };
  poke: {
    authors: Record<authorId, AuthorSubmissionHistory>;
  };
  submissions: Submissions;
  templates: Templates;
  emailHistory: EmailHistory;
}

export interface TemplateResponse {
  id: number;
  name: string;
  subject: string;
  template: string;
}
