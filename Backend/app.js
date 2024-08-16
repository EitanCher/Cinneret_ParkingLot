// import express from "express";
// import { router } from "./routers/user";
const express = require("express");
const userRouter = require("./routers/user");
const adminRouter = require("./routers/admin");

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from Express Server");
});

app.use("/api/users", userRouter);

// app.get("/users", (req, res) => {
//   res.json(users);
// });

// app.post("/users", (req, res) => {
//   const name = req.body.name;
//   const userExist = users.find((user) => user.name === name);

//   if (userExist) {
//     return res.status(500).json({ message: "Name already exists" });
//   }

//   users.push({ name, age: 33 });
//   return res.status(200).json(users);
// });

const PORT = process.env.PORT ?? 3001;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
