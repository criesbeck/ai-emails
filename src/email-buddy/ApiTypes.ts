export type Status = "Not done" | "Almost done" | "Done" | "Well done!";

export interface Author {
  name: string;
  email: string;
  id: number;
}

export type Authors = Record<string, Author>;

export interface Submission {
  author: number;
  submitted: number;
  exid: number;
  status: Status;
}

export interface Submissions {
  exercises: Record<string, string>;
  ai: number[];
  challenge: number[];
  submissions: Record<string, Submission>;
}
