const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = 8080;
const urlDatabase = {
  b3s2xk4: "http://www.facebook.com",
  l2ldwo1: "http://www.google.com",
};
const users = {
  'user1RandomID': {
    id: 'user1RandomID',
    email: 'user1@example.com',
    password: 'myDifficultpass'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'thisOneEasy'
  }
};

app.set('view engine', "ejs");
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

//User object by user_id in cookies
const getUserByuserID = function (user_id) {
  const user = users[user_id];
  return user;
};

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//Registeration data capture
app.post('/register', (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];
  const randID =  generateRandomString();
  users[randID] = { 
    id: randID,
    email: email,
    password: password
  };
  res.cookie('user_id', randID);
  res.redirect('/urls');
});

// Registeraiton Page visit
app.get('/register', (req, res) => {
  const templateVars = {
    user: getUserByuserID(req.cookies["user_id"])
  };
  res.render('register', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const cookies = cookieParser(req.cookies);
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: shortURL,
     longURL: urlDatabase[shortURL],
     user: getUserByuserID(req.cookies["user_id"])
     };
  res.render('urls_Show', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: getUserByuserID(req.cookies["user_id"])
   };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  const templateVars = { 
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: getUserByuserID(req.cookies["user_id"])
   };
  res.render('urls_Show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`);
});

function generateRandomString() {
  const randNum = Math.random() + 1;
  return randNum.toString(36).substring(5);
}
