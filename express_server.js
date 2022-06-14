const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const port = 8080;
const urlDatabase = {
  "b3s2xk4": "http://www.facebook.com",
  "l2ldwo1": "http://www.google.com"
};

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended : true}));

app.get('/', (req, res) => {
  res.send("Home Page");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
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
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], };
  res.render('urls_Show', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], }
  res.render(`urls_Show`, templateVars);
});

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`)
});

function generateRandomString() {
  const randNum = (Math.random() + 1 );
  return randNum.toString(36).substring(5);
};