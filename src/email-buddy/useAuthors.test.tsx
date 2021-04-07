import { partitionIntoWeeks } from "./useAuthors";
import snapshot from "./snapshot.json";

describe("Partitioning submissions into weeks", () => {
  test("Works with the original mock data set", () => {
    expect(partitionIntoWeeks(snapshot.input)).toEqual(snapshot.output);
  });
});
