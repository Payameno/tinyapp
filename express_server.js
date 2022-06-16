const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = 8080;
const urlDatabase = {
  b3s2xk4: {
    longURL: "http://www.facebook.com",
    userID: "user1RandomID",
  },
  l2ldwo1: {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
  sd2d6j0: {
    longURL: "http://www.yahoo.com",
    userID: "user2RandomID",
  },
};
const users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user1@example.com",
    password: "pizzy",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "easy",
  },
};

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

//User object by user_id in cookies
const getUserByuserID = function (user_id) {
  const user = users[user_id];
  return user;
};

const getUserbyEmail = function (email) {
  for (let key in users) {
    let user = users[key];
    if (user.email === email) return user;
  }
};

const getShortURLbyuserID = function (user_id) {
  const keys = Object.keys(urlDatabase);
  keys.forEach(key => {
    if (key === user_id) {
      return shortURL = key;
    }
  });
};

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Registeration data capture
app.post("/register", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  if (email === "" || password === "" || getUserbyEmail(email)) {
    res.sendCode(400);
  }
  const randID = generateRandomString();
  users[randID] = {
    id: randID,
    email: email,
    password: password,
  };
  res.cookie("user_id", randID);
  res.redirect("/urls");
});

// Registeraiton Page visit
app.get("/register", (req, res) => {
  const templateVars = {
    user: getUserByuserID(req.cookies["user_id"]),
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: getUserByuserID(req.cookies["user_id"]) };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const credentials = req.body;

  if (!getUserbyEmail(credentials.email)) {
    res.sendStatus(403);
  } else {
    const email = credentials.email;
    const password = credentials.password;
    const user = getUserbyEmail(email);
    if (user.password === password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: getUserByuserID(req.cookies["user_id"]),
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlDatabaseObject = urlDatabase[shortURL];
  const longURL = urlDatabaseObject.longURL;
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const cookies = cookieParser(req.cookies); //does this even do anything here?
  if (!getUserByuserID(req.cookies["user_id"])) {
    res.redirect('/login');
  } else {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.sendStatus(404);
  } else {
  const urlDatabaseObject = urlDatabase[shortURL];
  console.log(urlDatabaseObject);
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabaseObject.longURL,
    user: getUserByuserID(req.cookies["user_id"]),
  };
  res.render("urls_Show", templateVars);
}}
});

app.get("/urls", (req, res) => {
  if (!getUserByuserID(req.cookies["user_id"])) {
    res.redirect('login');
  } else {
    const user_id = req.cookies["user_id"];
    console.log(user_id);
    shortURL = getShortURLbyuserID(user_id);
  const templateVars = {
    user_id: user_id,
    shortURL,
    urls: urlDatabase,
    user: getUserByuserID(req.cookies["user_id"]),
  };
  res.render("urls_index", templateVars);
}
});

app.post("/urls", (req, res) => {
  const longURL = (req.body.longURL);
  const shortURL = generateRandomString();
  const userID = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID,
  };
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: getUserByuserID(req.cookies["user_id"]),
  };
  console.log(urlDatabase);
  res.render("urls_Show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  const urlDatabaseObject = urlDatabase[shortURL];
  urlDatabaseObject.longURL = longURL;
  res.redirect("/urls");
});

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`);
});

function generateRandomString() {
  const randNum = Math.random() + 1;
  return randNum.toString(36).substring(5);
}
