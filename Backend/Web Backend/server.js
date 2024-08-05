import express from "express";
import bodyParser from "body-parser";
import Queries from "./Queries";
import path from "path";
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {});

app.listen(port, () => {
  console.log(`object listening on port ${port}`);
});
