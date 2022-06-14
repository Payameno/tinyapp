const express = require('express');
const app = express();
const port = 8080;

const urlDatabase = {
  "b3s2xk4": "http://www.facebook.com",
  "l2ldwo1": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send("Hey there!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>world</b></body><html>\n")
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], };
  res.render('urls_Show', templateVars);
})

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`)
});