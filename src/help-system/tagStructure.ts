import {
  ApiResponse,
  Author,
  AuthorSubmissionHistory,
} from "./CriticStructure";

export interface CourseContext {
  currentTime: number;
  weekStartTime: number;
  currentWeek: number;
  aiExercises: Set<number>;
  challengeExercises: Set<number>;
}

export interface Tag {
  name: string;
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

export type Student = Author & Issues;

export type TagReducer = (ctx: TagContext) => Tag;

export interface TagFilterContext {
  issues: Tag[];
  history: AuthorSubmissionHistory;
  ctx: CourseContext;
}

export type TagValidator = (ctx: TagFilterContext) => Tag[];
