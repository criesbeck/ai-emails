import express from "express";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.post("/emails", async (_, res, __) => {
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
