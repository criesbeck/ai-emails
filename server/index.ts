import express from "express";
import morgan from "morgan";
import path from "path";
import expressFormidable from "express-formidable";
import { promises } from "fs";
const { readFile, writeFile } = promises;

const thePath = path.join(__dirname, "examples", "templates.json");

const app = express();
app.use(morgan("dev"));
app.use(expressFormidable());

app.get("/templates", async (_, res, __) => {
  res.sendFile(thePath);
});

app.put("/templates", async (req, res) => {
  if (!req.fields) return res.sendStatus(404);
  const file = await readFile(thePath, "utf-8");
  const json = JSON.parse(file);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [[_, issueString]] = Object.entries(req.fields);
  const issue = JSON.parse(issueString as string);
  const newJson = JSON.stringify({ ...json, [issue.name]: issue });
  await writeFile(thePath, newJson);
  res.sendStatus(200);
});

app.post("/emails", async (req, res, __) => {
  console.log(req.fields);
  res.sendStatus(200);
});

const main = () => {
  app.listen("8080", () => {
    console.log(`Server listening on port 8080`);
  });
};

if (require.main === module) {
  main();
}
