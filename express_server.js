const express = require("express");
const req = require("express/lib/request");
const bcrypt = require("bcryptjs");
const findUserByEmail = require("./helpers");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 9000; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
// helper function

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

// const getUserByEmail = function(email, database) {
//     req.body;
//     return user;
//   };

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

// const getUserByEmail = function (email, userDB) {
//   const userValues = Object.values(userDB);
//   const findEmail = userValues.find((user) => email === user.email);
//   return findEmail;
// };

// const findUserByEmail = (email) => {
//   for (const userId in users) {
//     const user = users[userId];
//     if (user.email === email) {
//       return user;
//     }
//   }
//   return null;
// };

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/registration", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  // const id = generateRandomString();
  const { email, password } = req.body;

  console.log("This is users", users);

  if (!email || !password) {
    console.log("bad email and password");
    res.send("Please insert email and password");
    return res.status(400);
  }

  const user = findUserByEmail(email, users);
  console.log(user);

  //   const userValues = Object.values(users);
  //   const findEmail = userValues.find((user) => email === user.email);
  //   console.log("This is find email", findEmail);
  // const findPass = userValues.find(user => password === user.password)
  //   console.log("This is findPass:", findPass);
  if (!user) {
    // console.log(findEmail);
    return res.status(403).send("This email not found");
    // return res.redirect('/registration')
  } else {
    // console.log("password", password, findEmail.hashedPassword);
    if (!bcrypt.compareSync(password, user.hashedPassword)) {
      res.send("Password did not match");
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }

  // if(findEmail && !findPass) {
  //     return res.status(403).send('This password does not match')
  // }

  // const hashedPassword = bcrypt.hashSync(password,10)
  console.log("This is hashpass");
  console.log("This is password: +/password ", findEmail.hashedPassword);
  // console.log("This is bcrypt", bcrypt.compareSync(password, findEmail.hashedPassword))

  // bcrypt.compare(password, findPass.password, function(err, success) {
  //     if (!success) {
  //         return res.status(400).send("pasdsffdsssword does not match")
  //     }
  // });

  // bcrypt.compareSync(password, );

  // users[id] = {id, email, password}
});

app.get("/urls", (req, res) => {
  // const id = req.cookies['user_id']
  const user_id = req.session["user_id"];
  console.log("This is the user id", user_id);
  // const user = users[id] //

  const userValues = Object.values(users);
  const findUser = userValues.find((user) => user_id === user.id);
  console.log("This is find user", findUser);
  const templateVars = { urls: urlsForUser(user_id), user: findUser };
  res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10); //bcrypt
  console.log("This is hashed password: ", hashedPassword); //need to store the hash password in the database

  if (!email || !password) {
    console.log("bad email and password");
    return res.status(400);
  }

  const user = findUserByEmail(email, users);

  if (user) {
    return res.status(400).send("This email found");
  } else {
    let user = { id, email, hashedPassword }; /////////////////////
    users[id] = user;
    console.log("This is the users", users);
    req.session.user_id = id;

    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

// app.get('urls/:id', (req, res) => {
//     const templateVars = {user:users[req.cookies["user_id"]]}
//     res.render('urls_id', templateVars)
// })

app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.editURL;
  urlDatabase[req.params.shortURL].longURL = newLongURL;
  res.redirect("/urls/");
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  console.log("this is ccd", userID);
  if (!userID) {
    return res.status(404).send("Please login.");
  } else if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("This data do not exist");
  } else if (userID !== urlDatabase[req.params.shortURL].userID) {
    return res.status(404).send("You do not have this url");
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

// app.get('/urls/:id', (req,res) => {
//     res.render('urls_new');
// })

app.post("/urls", (req, res) => {
  const userid = req.session.user_id;
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: longURL, userID: userid };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.post('/login', (req,res) => {
//     res.cookie('username', req.body.username)
//     res.redirect('/urls')

// })

app.post("/logout", (req, res) => {
  // const templateVars = {urls: urlDatabase, user:users[req.cookies["user_id"]]}
  // res.render('urls_index', templateVars)
  console.log(req.session.user_id, "This is a user id req.session");
  //   res.clearCookie("session");
  req.session = null;
  console.log("Clear cookie");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userid = req.session.user_id;
  const userIDfromdataBase = urlDatabase[req.params.shortURL].userID;

  if (userid === userIDfromdataBase) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(404).send("You cannot delete this URL");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
