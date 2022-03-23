const express = require("express");
const req = require("express/lib/request");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());

app.set('view engine', 'ejs');

function generateRandomString() {
    return Math.random().toString(36).slice(-6)
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {'user1ID': {
    id: "1ID",
    email: "u1@example.com",
    password: '123'
},
'user2ID': {
    id: '2ID',
    email: 'u2@example.com',
    password: '456'
}
}

app.get("/", (req, res) => {
    
  res.send("Hello!");
});

app.get('/registration', (req, res) => {
    const templateVars = {urls: urlDatabase, user:users[req.cookies["user_id"]]}
    res.render('registration', templateVars)
})

app.get('/login', (req,res) => {
    const templateVars = {urls: urlDatabase, user:users[req.cookies["user_id"]]}
    res.render('login', templateVars);
})

app.post('/login', (req, res) => {
    const id = generateRandomString();
    const {email, password} = req.body;

    if(!email || !password) {
        console.log("bad email and password")
        res.send("Please insert email and password")
        return res.status(400)
        
    }

    const userValues = Object.values(users);
    const findEmail = userValues.find(user => email === user.email)
    const findPass = userValues.find(user => password === user.password)
    if(!findEmail){
        console.log(findEmail)
        return res.status(403).send('This email not found')
    }

    if(findEmail && !findPass) {
        return res.status(403).send('This password does not match')
    }

    users[id] = {id, email, password}
    res.cookie('user_id', findEmail.id)
    res.redirect('/urls');
})

app.get('/urls', (req, res) => {
    // const id = req.cookies['user_id']
    // const user = users[id] //
    const userValues = Object.values(users);
    const user_id = req.cookies["user_id"]
    const findUser = userValues.find(user => user_id === user_id)
    console.log(findUser)
    const templateVars = {urls: urlDatabase, user: findUser};
    res.render('urls_index', templateVars);
})

app.post('/register', (req,res) => {
    const id = generateRandomString();
    const {email, password} = req.body;


    if(!email || !password) {
        console.log("bad email and password")
        return res.status(400)
        
    }

    const userValues = Object.values(users);
    const findEmail = userValues.find(user => email === user.email)
    if(findEmail){
        return res.status(400).send('This email found')
    }

    users[id] = {id, email, password}
    res.cookie('user_id', id)

    res.redirect('/urls')
})

app.get('/urls/new', (req,res) => {
    const templateVars = {user:users[req.cookies["user_id"]]}
    res.render('urls_new', templateVars);
})

app.get('urls/:id', (req, res) => {
    const templateVars = {user:users[req.cookies["user_id"]]}
    res.render('urls_id', templateVars)
})

app.post('/urls/:shortURL', (req,res) => {
    const newLongURL = (req.body.editURL);
    urlDatabase[req.params.shortURL] = newLongURL
    res.redirect('/urls/')
})

app.get('/urls/:shortURL', (req, res) => {
    const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user:users[req.cookies["user_id"]]};
    console.log(req.params)
    res.render('urls_show', templateVars);
})

// app.get('/urls/:id', (req,res) => {
//     res.render('urls_new');
// })


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

// app.post('/login', (req,res) => {
//     res.cookie('username', req.body.username)
//     res.redirect('/urls')

// })

app.post('/logout', (req,res) => {
    const templateVars = {urls: urlDatabase, user:users[req.cookies["user_id"]]}
    res.render('urls_index', templateVars)
    res.clearCookie('user_id')
    // res.redirect('/urls')

})

app.post('/urls/:shortURL/delete', (req,res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});