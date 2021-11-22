const express = require("express");
const app = express();
// const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  userAlreadyExist,
  authenticateUserInfo,
} = require("./helpers.js");
const PORT = 8080;

app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// To Login Page
app.get("/", (req, res) => {                  
  res.render("login", { user: null });
});

// To URL page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase),
    user: users[req.session["user_id"]],
  };
  res.render("urls_index", templateVars);
});

//GET route to render the New URL
app.get("/urls/new", (req, res) => {
  const newUserId = req.session.user_id;
  if (!users[newUserId]) {
    res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

// Show User their Newly Created Link
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session["user_id"]],
  };
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Unauthorised User");
  }
});

// Redirect any request to "/u/:shortURL" to its LongURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL); 
});

// Request POST /urls when form is submitted generating random string(shortURL)
//shortURL-longURL key-value pair are saved to the urlDatabase.
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newUrl] = {
    longURL: longURL,
    userID: req.session["user_id"],
  };
  res.redirect("/urls");
});

// For Editting the URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.newLongUrl;
  urlDatabase[shortURL].longURL = longURL;
  console.log(shortURL, longURL);
  res.redirect("/urls");
});

// To Delete the URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const delShort = req.params.shortURL;
  delete urlDatabase[delShort];
  res.redirect("/urls");
});

// To Login Page
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  res.render("login", { user });
});

// To Register Page
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  res.render("register", { user });
});

// Check the Email and Password to Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { error } = userAlreadyExist(email, users);
  if (!error) {
    res.status(400).send(`Not an User Try again <a href ='login'> Login </a>`);
  } else {
    const user = getUserByEmail(email, users);
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(400).send("Invalid Password");
    }
    req.session.user_id = user["id"];
    res.redirect("/urls");
  }
});

// Create New User or Check if the User Id already Exist
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const { error } = authenticateUserInfo(email, password, users);
  if (error) {
    res
      .status(400)
      .send(`${error}. Please try again :  <a href="/register"> Register </a>`);
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = { id: id, email: email, password: hashedPassword };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// Logout 
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 