import express from "express";
import morgan from "morgan";
import path from "path";
import expressFormidable from "express-formidable";
import { promises } from "fs";
const { readFile, writeFile } = promises;

const pokePath = path.join(__dirname, "poke-325-export.json");
const submissionPath = path.join(__dirname, "example-submission-data.json");
const authorsPath = path.join(__dirname, "authors.json");
const templatePath = path.join(__dirname, "examples", "templates.json");

const app = express();
app.use(morgan("dev"));
app.use(expressFormidable());

app.get("/poke", (_, res, __) => {
  res.sendFile(pokePath);
});

app.get("/submission", (_, res, __) => {
  res.sendFile(submissionPath);
});

app.get("/authors", (_, res, __) => {
  res.sendFile(authorsPath);
});

app.get("/templates", async (_, res, __) => {
  res.sendFile(templatePath);
});

app.put("/templates", async (req, res) => {
  if (!req.fields) return res.sendStatus(404);
  const file = await readFile(templatePath, "utf-8");
  const json = JSON.parse(file);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newJson = JSON.stringify({
    ...json,
    [`${req.fields.name}`]: { ...req.fields },
  });
  await writeFile(templatePath, newJson);
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
