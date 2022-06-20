const express = require("express");
const bodyparser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByUserId, getUserbyEmail, generateRandomString, getShortUrlByUserId } = require("./helpers");
const app = express();
const port = 8080;
const users = {};
const urlDatabase = {
  b3s2xk4: {
    longUrl: "http://www.facebook.com",
    userId: "user1RandomId",
  },
  l2ldwo1: {
    longUrl: "http://www.google.com",
    userId: "user2RandomId",
  },
  sd2d6j0: {
    longUrl: "http://www.yahoo.com",
    userId: "user2RandomId",
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
    const longUrl = req.body.longUrl;
    const shortUrl = generateRandomString();
    const user = getUserByUserId(user_id, users);
    urlDatabase[shortUrl] = {
      userId: user_id,
      longUrl,
    };
    const templateVars = {
      shortUrl,
      longUrl,
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
    const shortUrl = getShortUrlByUserId(user_id, urlDatabase);
    const user = getUserByUserId(user_id, users);
    const templateVars = {
      urls: urlDatabase,
      user_id,
      shortUrl,
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
  const randId = generateRandomString();
  users[randId] = {
    id: randId,
    email,
    password,
  };
  req.session.user_id = randId;
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = {
      user: getUserByUserId(user_id, users),
    };
    res.render("register", templateVars);
  }
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if (!getUserByUserId(user_id, users)) {
    const templateVars = { user: getUserByUserId(user_id, users) };
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
  res.redirect("/");
});
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: getUserByUserId(user_id, users),
    };
    res.render("urls_new", templateVars);
  }
});
app.get("/u/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortUrl = req.params.id;
  if (!user_id || urlDatabase[shortUrl].userId !== user_id) {
    res.sendStatus(401);
  } else {
    if (!urlDatabase[shortUrl]) {
      res.sendStatus(404);
    }
  }
  const urlObject = urlDatabase[shortUrl];
  const longUrl = urlObject.longUrl;
  res.redirect(longUrl);
});
app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.sendStatus(401);
  } else {
    const user = getUserByUserId(user_id, users);
    const shortUrl = req.params.id;
    if (!urlDatabase[shortUrl] || urlDatabase[shortUrl].userId !== user_id) {
      res.sendStatus(401);
    } else {
      const urlObject = urlDatabase[shortUrl];
      const templateVars = {
        shortUrl: shortUrl,
        longUrl: urlObject.longUrl,
        user,
      };
      res.render("urls_Show", templateVars);
    }
  }
});
app.post("/urls/:shortUrl/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortUrl = req.params.shortUrl;
  const ShortUrlByUser = getShortUrlByUserId(user_id, urlDatabase);
  if (!user_id) {
    res.sendStatus(403);
  }
  if (ShortUrlByUser.includes(shortUrl)) {
    delete urlDatabase[shortUrl];
    return res.redirect("/urls");
  }
  res.sendStatus(403);
});
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortUrl = req.params.id;
  const ShortUrlByUser = getShortUrlByUserId(user_id, urlDatabase);
  if (!user_id) {
    res.sendStatus(403);
  } else if (!ShortUrlByUser.includes(shortUrl)) {
    res.sendStatus(403);
  }
  const longUrl = req.body.longUrl;
  const urlObject = urlDatabase[shortUrl];
  urlObject.longUrl = longUrl;
  res.redirect("/urls");
});

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`);
});