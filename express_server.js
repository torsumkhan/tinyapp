const express = require("express");
const req = require("express/lib/request");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs');

function generateRandomString() {
    return Math.random().toString(36).slice(-6)
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls/new', (req,res) => {
    res.render('urls_new');
})

app.get('urls/:id', (req, res) => {
    res.render('urls_id')
})

app.get('/urls/:shortURL', (req, res) => {
    const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    // console.log(req.params)
    res.render('urls_show', templateVars);
})

app.get('/urls', (req, res) => {
    const templateVars = {urls: urlDatabase};
    res.render('urls_index', templateVars);
})

app.post('/urls', (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString()
    urlDatabase[shortURL] = longURL;
    console.log(urlDatabase)
    res.redirect(`/urls/${shortURL}`)
})


app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    console.log(longURL)
    res.redirect(longURL);
})


app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});