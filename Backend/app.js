// import express from "express";
// import { router } from "./routers/user";
const express = require("express");
const userRouter = require("./routers/user");
const adminRouter = require("./routers/admin");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//--------------------------------------------------------------------------------------------------------------------------------//
// Use Helmet to protect against well-known web vulnerabilities
app.use(helmet());

// Define a Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'trusted-scripts.com'"],
      styleSrc: ["'self'", "'trusted-styles.com'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "'fonts.gstatic.com'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
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

// Defer Until Core Functionality is Stable:
// Cross-Site Request Forgery (CSRF):

// CSRF Protection: Implement CSRF protection once you have authentication in place. It becomes crucial when you have forms or actions that change user data.
// Cross-Site Scripting (XSS):

// CSP Implementation: CSP can be complex and might interfere with development. Implement it once your application is functional to protect against XSS and data injection attacks.
// Secure Cookies:

// Cookie Flags (e.g., HttpOnly, Secure): Set secure cookie attributes after you have your authentication and session management working.
// Rate Limiting and IP Blocking:

// Rate Limiting: Implement rate limiting to prevent abuse. It's useful but might be added after core functionality.
// HTTPS:

// HTTPS: Ensure your application uses HTTPS before deploying it to production. It protects data in transit but can be set up towards the end of your development process.
