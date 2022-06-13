const express = require('express');
const app = express();
const port = 8080;

const urlDatabase = {
  "b3s2xk4": "http://www.facebook.com",
  "l2ldwo1": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hey there!");
});

app.listen(port, () => {
  console.log(`I'm listening to you on ${port}`)
});