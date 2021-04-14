export type WEEK =
  | "WEEK_1"
  | "WEEK_2"
  | "WEEK_3"
  | "WEEK_4"
  | "WEEK_5"
  | "WEEK_6"
  | "WEEK_7"
  | "WEEK_8"
  | "WEEK_9"
  | "WEEK_10"
  | "WEEK_11"
  | "WEEK_12"
  | "WEEK_13";

export type Weeks = Record<WEEK, number>;

export interface TestCase {
  description: string;
  week: WEEK;
  studentName: string;
  issueName: string;
  errorIfExists?: boolean;
}

export interface TestInputs {
  weeks: Weeks;
  tests: TestCase[];
}
