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
    user: req.cookies["user"],
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies.user,
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.send(
      '<div>Please login first</div><a href="http://localhost:8080/login">Redirect to Login</a>'
    );
  }
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user"],
  };
  if (!templateVars.longURL) {
    return res.send("this url does not exist");
  }
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
  const tempUser = findUserEmail(req.body.email, users);
  if (!tempUser) {
    return res.status(403).send("Please provide a registered email address");
  }
  if (req.body.password !== tempUser.password) {
    return res.status(403).send("Please provide a matching password");
  }
  res.cookie("user", tempUser.id);
  const templateVars = {
    user: tempUser.id,
    urls: urlDatabase,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/login");
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
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies.user,
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(400).send("Please provide an email address");
  }
  const emailTaken = findUserEmail(email, users);
  if (emailTaken) {
    return res.status(400).send("Email already taken");
  }
  users[id] = { id, email, password };
  res.cookie("user", id);
  console.log(users);
  res.redirect("/urls");
});
const findUserEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies.user,
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});
