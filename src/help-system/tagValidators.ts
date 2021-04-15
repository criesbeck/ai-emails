import { TagValidator } from "./tagStructure";

export const weightValidator: TagValidator = (tags) => {
  return tags.filter((tag) => tag.weight > 0);
};
