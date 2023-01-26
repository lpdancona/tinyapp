const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require("./helpers");
app.use(
  cookieSession({
    name: "session",
    keys: ["bsvehvfyuger"],
  })
);

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
app.get("/", (req, res) => {
  res.redirect("/register");
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
  const id = req.session.user;
  const user = users[id];
  if (!user) {
    return res.send(
      "please login or register first<a href=http://localhost:8080/register>Redirect to registration</a>"
    );
  }
  console.log(req.session);
  const userUrls = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: req.session["user"],
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user,
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
  const userId = req.session.user;
  const user = users[userId];
  if (!user) {
    return res.send("please login");
  }
  const shortUrl = req.params.id;
  if (urlDatabase[shortUrl].userID !== userId) {
    return res.send("You do not have permission");
  }
  const templateVars = {
    id: shortUrl,
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session["user"],
  };
  if (!templateVars.longURL) {
    return res.send("this url does not exist");
  }
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const userId = req.session.user;
  const value = req.body.longURL;
  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: value,
    userID: userId,
  };
  res.redirect(`/urls/${key}`);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  const deleteKey = req.params.id;
  const userId = req.session.user;
  const user = users[userId];
  if (!user) {
    return res.send("Please login first");
  }
  if (!urlDatabase[deleteKey]) {
    return res.send("Url does not exist");
  }
  if (urlDatabase[deleteKey].userID !== userId) {
    return res.send("You do not have permission");
  }
  console.log(req.body); // Log the POST request body to the console
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  const userId = req.session.user;
  const user = users[userId];
  if (!user) {
    return res.send("Please login first");
  }
  if (!urlDatabase[key]) {
    return res.send("Url does not exist");
  }
  if (urlDatabase[key].userID !== userId) {
    return res.send("You do not have permission");
  }
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[key].longURL = req.body.longUrl;
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide an email address");
  }
  const tempUser = getUserByEmail(email, users);
  console.log(tempUser);
  if (!tempUser) {
    return res.status(403).send("Please provide a registered email address");
  }
  if (!bcrypt.compareSync(password, tempUser.password)) {
    return res.status(403).send("Please provide a matching password");
  }
  req.session.user = tempUser.id;
  const templateVars = {
    user: tempUser.id,
    urls: urlDatabase,
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
app.get("/register", (req, res) => {
  const userId = req.session.user;
  const user = users[userId];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: req.session.user,
  };
  res.render("urls_register", templateVars);
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
  const emailTaken = getUserByEmail(email, users);
  if (emailTaken) {
    return res.status(400).send("Email already taken");
  }
  users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
  console.log(bcrypt.hashSync(password, 10));
  req.session.user = id;
  console.log(users);
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user,
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});
