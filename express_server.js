const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  console.log(req.cookies);
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const value = req.body.longURL;
  const key = generateRandomString();
  urlDatabase[key] = value;
  res.redirect(`/urls/${key}`);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const deleteKey = req.params.id;
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const key = req.params.id;
  urlDatabase[key] = req.body.longUrl;
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.cookie("username", req.body.username);
  const templateVars = {
    username: req.body.username,
    urls: urlDatabase,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.post("/logout", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.clearCookie("username");
  res.redirect("/urls");
});
const generateRandomString = function () {
  let result = "";
  const len = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = len; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
