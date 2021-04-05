export type Status = "Not done" | "Almost done" | "Done" | "Well done!";

export interface Author {
  name: string;
  email: string;
  id: number;
}

export type Authors = Record<string, Author>;

export type Submissions = Record<string, Submission>;

export interface Submission {
  author: number;
  submitted: number;
  exid: number;
  status: Status;
}
