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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// renders page that stores created urls in case the user has already loged in
app.get("/urls", (req, res) => {
  const id = req.session.user;
  const user = users[id];
  if (!user) {
    return res.send(
      "please login or register first<a href=http://localhost:8080/register>Redirect to registration</a>"
    );
  }
  const userUrls = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user,
  };
  res.render("urls_index", templateVars);
});
// renders the page that allows user to create new urls
app.get("/urls/new", (req, res) => {
  const id = req.session.user;
  const user = users[id];
  const templateVars = {
    user,
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.send(
      '<div>Please login first</div><a href="http://localhost:8080/login">Redirect to Login</a>'
    );
  }
});
// find edit page with url id
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user;
  const user = users[userId];
  if (!user) {
    return res.send("please login");
  }
  const shortUrl = req.params.id;
  if (urlDatabase[shortUrl].userID !== userId) {
    return res.send("You do not have permission to this url");
  }
  const templateVars = {
    id: shortUrl,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  if (!templateVars.longURL) {
    return res.send("this url does not exist");
  }
  res.render("urls_show", templateVars);
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
  urlDatabase[key].longURL = req.body.longUrl;
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
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
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});
// deletes selected url and takes user to stored urls
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
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});
// object that stores the values input by the user
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
// register route get
app.get("/register", (req, res) => {
  const userId = req.session.user;
  const user = users[userId];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("urls_register", templateVars);
});
// register route post
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res
      .status(400)
      .send("Please provide an email address and a password");
  }
  const emailTaken = getUserByEmail(email, users);
  if (emailTaken) {
    return res.status(400).send("Email already taken");
  }
  users[id] = { id, email, password: bcrypt.hashSync(password, 10) };
  req.session.user = id;
  res.redirect("/urls");
});
// login route post
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide an email address");
  }
  const tempUser = getUserByEmail(email, users);
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
  res.render("urls_index", templateVars);
});
// login route get
app.get("/login", (req, res) => {
  const userId = req.session.user;
  const user = users[userId];

  const templateVars = {
    user,
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});
//deletes cookies and logsout taking the user to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
