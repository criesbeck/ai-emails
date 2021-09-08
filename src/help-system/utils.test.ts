import { authorsMap } from "./utils";
import apiJson from "../../api.json";

describe("Creating an authors map", () => {
  test("Works on the example data", () => {
    expect(apiJson.REACT_APP_POKE.authors).toEqual(
      authorsMap({
        authors: apiJson.REACT_APP_AUTHORS,
        submissions: apiJson.REACT_APP_SUBMISSION_DATA as any,
        templates: {},
        emailHistory: [],
      })
    );
  });
});
