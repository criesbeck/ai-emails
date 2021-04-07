import { Submission } from "./ApiTypes";
import { partitionIntoWeeks } from "./useAuthors";

describe("Partitioning submissions into weeks", () => {
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  test("Works with the original mock data set", () => {
    const submissions: Submission[] = [
      { exid: 1, author: 24, status: "Done", submitted: Date.now() },
      { exid: 2, author: 24, status: "Done", submitted: Date.now() + ONE_WEEK },
      {
        exid: 3,
        author: 24,
        status: "Done",
        submitted: Date.now() + 2 * ONE_WEEK,
      },
    ];
    expect(partitionIntoWeeks(submissions)).toEqual(
      submissions.map((submission) => [submission])
    );
  });
});
