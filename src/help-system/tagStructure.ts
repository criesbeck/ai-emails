import {
  ApiResponse,
  Author,
  AuthorSubmissionHistory,
  Templates,
} from "./CriticStructure";

export interface CourseContext {
  currentTime: number;
  weekStartTime: number;
  currentWeek: number;
  aiExercises: Set<number>;
  challengeExercises: Set<number>;
  templates: Templates;
}

export interface Tag {
  id: number;
  name: string;
  subject: string;
  template: string;
  weight: number;
}

export interface WebContext {
  data: ApiResponse;
  currentTime: number;
}

export interface TagContext {
  student: Author;
  history: AuthorSubmissionHistory;
  ctx: CourseContext;
}

export interface Issues {
  issues: Tag[];
}

export interface Student {
  name: string;
  email: string;
  id: number;
  issues: Tag[];
  previousEmail: string | null;
}

export type TagReducer = (ctx: TagContext) => Tag;

export interface TagProcessContext {
  issues: Tag[];
  history: AuthorSubmissionHistory;
  ctx: CourseContext;
}

export type TagPostProcessor = (ctx: TagProcessContext) => Tag[];

export interface Students {
  students: Student[];
  emailedStudents: Student[];
}
