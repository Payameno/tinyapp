const express = require("express");
const bodyparser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserbyEmail } = require("./helpers");
const app = express();
const port = 8080;
const users = {};
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
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["uh3jsds43fero2s", "54odere546efjkr", "ifdjka43sG44343ds"],
    maxAge: 1 * 60 * 60 * 1000, // 1 Hour
  })
);

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.sendStatus(401);
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    const user = getUserByuserID(user_id);
    urlDatabase[shortURL] = {
      userID: user_id,
      longURL,
    };
    const templateVars = {
      shortURL,
      longURL,
      user,
    };
    res.render("urls_Show", templateVars);
  }
});
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.sendStatus(403);
  } else {
    const shortURL = getUserIDbyShortURL(user_id, urlDatabase);
    const user = getUserByuserID(user_id);
    const templateVars = {
      urls: urlDatabase,
      user_id,
      shortURL,
      user,
    };
    res.render("urls_index", templateVars);
  }
});
app.post("/register", (req, res) => {
  const email = req.body["email"];
  const userInputPassword = req.body["password"];
  if (
    email === "" ||
    userInputPassword === "" ||
    getUserbyEmail(email, users)
  ) {
    return res.sendStatus(406);
  }
  const password = bcrypt.hashSync(userInputPassword, 10);
  const randID = generateRandomString();
  users[randID] = {
    id: randID,
    email: email,
    password: password,
  };
  req.session.user_id = randID;
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = {
      user: getUserByuserID(user_id),
    };
    res.render("register", templateVars);
  }
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if (!getUserByuserID(user_id)) {
    const templateVars = { user: getUserByuserID(user_id) };
    res.render("login", templateVars);
  }
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  const credentials = req.body;
  if (!getUserbyEmail(credentials.email, users)) {
    res.sendStatus(403);
  } else {
    const email = credentials.email;
    const password = credentials.password;
    const user = getUserbyEmail(email, users);
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/"); //Dear Mentor: Assigment has set Get/URLS for non-users as "Error", while also requires logout to redirect to /URLS, which means receiving error after loging out, that is why i have set this as home directory
});
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: getUserByuserID(user_id),
    };
    res.render("urls_new", templateVars);
  }
});
app.get("/u/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;
  if (!user_id || urlDatabase[shortURL].userID !== user_id) {
    res.sendStatus(401);
  } else {
    if (!urlDatabase[shortURL]) {
      res.sendStatus(404);
    }
  }
  const urlObject = urlDatabase[shortURL];
  const longURL = urlObject.longURL;
  res.redirect(longURL);
});
app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.sendStatus(401);
  } else {
    const user = getUserByuserID(user_id);
    const shortURL = req.params.id;
    if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
      res.sendStatus(401);
    } else {
      const urlObject = urlDatabase[shortURL];
      const templateVars = {
        shortURL: shortURL,
        longURL: urlObject.longURL,
        user,
      };
      res.render("urls_Show", templateVars);
    }
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const shortURLByUser = getShortURLbyuserID(user_id, urlDatabase);
  if (!user_id) {
    res.sendStatus(403);
  }
  if (shortURLByUser.includes(shortURL)) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  res.sendStatus(403);
});
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;
  const shortURLByUser = getShortURLbyuserID(user_id, urlDatabase);
  if (!user_id) {
    res.sendStatus(403);
  } else if (!shortURLByUser.includes(shortURL)) {
    res.sendStatus(403);
  }
  const longURL = req.body.longURL;
  const urlObject = urlDatabase[shortURL];
  urlObject.longURL = longURL;
  res.redirect("/urls");
});

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`);
});

function generateRandomString() {
  const randNum = Math.random() + 1;
  return randNum.toString(36).substring(5);
}

const getUserIDbyShortURL = function (shortURL, database) {
  let userID;
  for (let key in database) {
    if (key === shortURL) {
      userID = database[key].userID;
    }
  }
  return userID;
};

const getUserByuserID = function (user_id) {
  const user = users[user_id];
  return user;
};

const getShortURLbyuserID = function (id, database) {
  let shortURLS = [];
  const keys = Object.keys(database);
  keys.forEach((key) => {
    if (database[key].userID === id) {
      shortURLS.push(key);
    }
  });
  return shortURLS;
};
