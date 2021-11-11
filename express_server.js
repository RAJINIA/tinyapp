const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT =8080; 


app.set("view engine", "ejs");
app.use(cookieParser());

//URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  // "3F6ipTX": "https://www.facebook.com/"
};

//USER Database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  console.log("The user id is: ", user_id);
  const user = users[req.cookies['user_id']];
  console.log("Thje user is: ", user);
  const templateVars = { 
    urls: urlDatabase,
    // username: req.cookies["username"]
    user: users[req.cookies['user_id']]
   };
   console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"]
    user: users[req.cookies.user_id]
  }; 
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: req.params.longURL,
    // username: req.cookies["username"]
    // user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
}); 

// Redirect to longURL with given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//  Create New URL
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newUrl] = longURL;
  res.redirect('/urls')
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const delShort = req.params.shortURL;
  delete urlDatabase[delShort];
  res.redirect('/urls') 
})


 app.post("/urls/:id", (req, res) => {
  console.log(req.body);                      // Log the POST request body to the console
  console.log(req.params.id);
  const shortURL = req.params.id;
  const longURL = req.body.newLongUrl;
  urlDatabase[shortURL] = longURL;
  console.log(shortURL , longURL);
  res.redirect('/urls'); 
});

// Create Register
app.get("/register", (req,res) => {
  const user = users[req.cookies.user_id]
  res.render('register',  {user} );
});

app.post("/register", (req, res) => {
  // console.log('req.body:',req.body)
  const userID = req.cookies.user_id
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Invalid Email or Password")
    return;
  }

  if (getUserByEmail(req.body.email)) {
    res.status(400).send("Email already exists")
    return
  }
  const user_id = generateRandomString()
  users[user_id] = { id: user_id, email: req.body.email, password: req.body.password }
  // console.log(users)
  res.cookie("user_id", user_id)
  res.redirect("/urls")
})

// Add Login Route
app.get("/login", (req,res) => {
  const user = users[req.cookies.user_id]
  res.render('login', {user});
})

app.post("/login", (req, res) => {
  //console.log("hello" + req.body.username);
  // res.cookie("username", req.body.username);
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (user) {
    if (user.password === password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.send("incorrect password");
    }
  } else {
    res.send("user not found");
  }
  
});

// POST for Logout
app.post("/logout", (req, res) => {
  console.log("logout");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//---------------------------------------------------------------------------------------
// app.get("/", (req, res) => {
//   res.send("Hello");
// })

// TO CHECK ALL THE VALUES OF THE DATABASE
// app.get("/urls.json", (req, res) => {
//   res.json(users);
// })

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// })

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });
//----------------------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

const getUserByEmail = function (email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return false
}


function generateRandomString() {
  let randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
}  