import { ApiResponse, Author } from "./CriticStructure";

export interface CourseContext {
  data: ApiResponse;
  currentTime: number;
}

export interface TagContext {
  student: Author;
  ctx: CourseContext;
}

export interface TagDescriptor {
  name: string;
  template: string;
  weight: number;
}

export interface TagPredicate {
  predicate: (ctx: TagContext) => boolean;
}

export type Tag = TagDescriptor & TagPredicate;

export interface Issues {
  issues: TagDescriptor[];
}

export type Student = Author & Issues;
