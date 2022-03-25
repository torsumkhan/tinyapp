const express = require("express");
const req = require("express/lib/request");
const bcrypt = require("bcryptjs");
const findUserByEmail = require("./helpers");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 9000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).slice(-6);
}

const urlsForUser = function (id) {
  const urlsForThisUser = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      urlsForThisUser[key] = urlDatabase[key].longURL;
    }
  }
  return urlsForThisUser;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user1ID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2ID",
  },
};

const users = {
  user1ID: {
    id: "user1ID",
    email: "u1@example.com",
    password: "123",
  },
  user2ID: {
    id: "user2ID",
    email: "u2@example.com",
    password: "456",
  },
};

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
    error: req.query.error,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("bad email and password");
    res.send("Please insert email and password");
    return res.status(400);
  }

  const user = findUserByEmail(email, users);
  console.log(user);

  if (!user) {
    return res.status(403).send("This email not found");
  } else {
    if (!bcrypt.compareSync(password, user.hashedPassword)) {
      res.send("Password did not match");
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];

  const userValues = Object.values(users);
  const findUser = userValues.find((user) => user_id === user.id);
  const templateVars = { urls: urlsForUser(user_id), user: findUser };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userid = req.session.user_id;
  if (!userid) {
    return res.status(404).send("You are not Logged in");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longURL, userID: userid };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/register", (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.send("Please insert email and password");
    return res.status(400);
  }

  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send("This email already exists. Please Login");
  } else {
    let user = { id, email, hashedPassword };
    users[id] = user;
    console.log("This is the users", users);
    req.session.user_id = id;

    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (!req.session.user_id) {
    return res.redirect("/login?error=1");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(404).send("Please login.");
  } else if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("This data do not exist");
  } else if (userID !== urlDatabase[req.params.shortURL].userID) {
    return res.status(404).send("You do not own this URL ");
  }

  const shortURL = req.params.shortURL;
  const urlObject = urlDatabase[shortURL];
  const longURL = urlObject.longURL;
  const templateVars = {
    longURL: longURL,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]],
  };
  if (urlObject.userID !== req.session["user_id"]) {
    return res.send("/urls");
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.editURL;
  urlDatabase[req.params.shortURL].longURL = newLongURL;
  res.redirect("/urls/");
});

app.get("/u/:shortURL", (req, res) => {
  const data = urlDatabase[req.params.shortURL];
  if (!data) {
    return res.error("URL does not exist");
  }
  res.redirect(data.longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userid = req.session.user_id;
  const userIDfromdataBase = urlDatabase[req.params.shortURL].userID;

  if (userid === userIDfromdataBase) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    return res.status(404).send("You cannot delete this URL");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
