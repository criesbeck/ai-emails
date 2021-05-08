import formidable from "formidable";
import express from "express";
import morgan from "morgan";
import path from "path";
import { promises } from "fs";
const { readFile, writeFile } = promises;
const pokePath = path.join(__dirname, "poke-325-export.json");
const submissionPath = path.join(__dirname, "example-submission-data.json");
const authorsPath = path.join(__dirname, "authors.json");
const templatePath = path.join(__dirname, "examples", "templates.json");
const historyPath = path.join(__dirname, "history.json");

const parse = async (req: Express.Request) => {
  // @ts-ignore
  const form = formidable({ multiples: true });
  return new Promise((res, rej) => {
    // @ts-ignore
    form.parse(req, (err: Error, fields: any) => {
      return err ? rej(err) : res(fields);
    });
  });
};

const app = express();
app.use(morgan("dev"));

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
  const fields: any = await parse(req);
  if (!fields) return res.sendStatus(404);
  const file = await readFile(templatePath, "utf-8");
  const json = JSON.parse(file);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newJson = JSON.stringify({
    ...json,
    [`${fields.name}`]: { ...fields },
  });
  await writeFile(templatePath, newJson);
  res.sendStatus(200);
});

interface Emails {
  id: string[];
  email: string[];
  message: string[];
  issues: string[];
}

interface Email {
  id: string;
  email: string;
  message: string;
  issueNames: string[];
  submissionTime: number;
}

type NewEmailJson = Record<string, Email>;

type HistoryJson = Record<string, Email[]>;

const zipForm = (emails: Emails): NewEmailJson => {
  const submissionTime = Date.now();
  return emails.id.reduce(
    (acc, id, index) => ({
      ...acc,
      [id]: {
        id,
        email: emails.email[index],
        message: emails.message[index],
        issues: emails.issues[index].split(":"),
        submissionTime,
      },
    }),
    {}
  );
};

app.get("/emails", async (_, res, __) => {
  res.sendFile(historyPath);
});

app.post("/emails", async (req, res, __) => {
  const oldHistFile: HistoryJson = JSON.parse(
    await readFile(historyPath, "utf-8")
  );
  const fields: any = await parse(req);
  if (!fields) return res.sendStatus(404);
  const json = zipForm(fields);
  const newHistFile = Object.keys(json).reduce(
    (acc, key) => ({ ...acc, [key]: [json[key], ...oldHistFile[key]] }),
    oldHistFile
  );
  await writeFile(historyPath, JSON.stringify(newHistFile));
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
