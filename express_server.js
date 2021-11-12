const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const PORT =8080; 

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

//NEW URL DATABASE
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }
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


app.get("/urls", (req, res) => {
  // const user = users[req.session['user_id']];
  // if (user) {
  //   const templateVars = { 
  //     urls: urlsForUser(req.session['user_id']),
  //     "user": user
  //    };
  //    res.render("urls_index", templateVars);
  // } else {
  //   // res.redirect("/login");
  //   res.status(400).send('Please Register/Login');
  // }
  
  const templateVars = { 
    urls: urlsForUser(req.session['user_id']),
    user: users[req.session['user_id']]
   };

  //  console.log(templateVars);
  res.render("urls_index", templateVars);
});


//  Create New URL
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[newUrl] = {
    longURL: longURL, 
    userID: req.session['user_id']
  };
  // urlDatabase[newUrl].userID = req.session['user_id'];
  res.redirect('/urls');
});



app.get("/urls/new", (req, res) => {
  const newUserId = req.session.user_id;
  console.log("users: ", users);
  console.log(users[newUserId]);

  if(!users[newUserId]) {
    res.redirect("/login");
  } 
  const templateVars = {
    // username: req.cookies["username"]
    user: users[req.session.user_id]
  }; 
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //console.log(shortURL);
  console.log(urlDatabase);
  const templateVars = {                         
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session['user_id']]
    // username: req.cookies["username"]
    // user: users[req.cookies.user_id]
  };
  // condional to check short url with cookieid 
  // if true do line 112
  //else res.status(400) u are not an authorised url

  if (shortURL === req.cookies.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Unauthorised User")
  }
}); 

//To Edit the longurl by clicking edit button
app.post("/urls/:shortURL", (req, res) => {
  const updatedLongURL = req.body.newLongUrl;
  // const userId = req.session.user_id;
  // let obj = {
  //   "longURL": longURL,
  //   "userId": userId
  // };
  urlDatabase[req.params.shortURL].longURL = updatedLongURL;
  res.redirect('/urls');
})

// Redirect to longURL with given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;         
  res.redirect(longURL);
});



// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params.shortURL);
  const delShort = req.params.shortURL;
  delete urlDatabase[delShort];
  res.redirect('/urls'); 
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
  const user = users[req.session.user_id]
  res.render('register',  {user} );
});

app.post("/register", (req, res) => {
  // console.log('req.body:',req.body)
  // const userID = req.cookies.user_id
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
  // res.cookie("user_id", user_id)
  req.session.user_id = user_id;
  res.redirect("/urls")
})

// Add Login Route
app.get("/login", (req,res) => {
  const user = users[req.session.user_id]
  res.render('login', {user});
})

app.post("/login", (req, res) => {
  //console.log("hello" + req.body.username);
  // res.cookie("username", req.body.username);
  const userEnteredEmail = req.body.email;
  const userEnteredPassword = req.body.password;
  const user = getUserByEmail(userEnteredEmail);
  if (user) {
    if (user.password === userEnteredPassword) {
      req.session.user_id = user.id;
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
  // console.log("logout");
  // res.clearCookie("user_id");
  req.session.user_id = null;
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


function generateRandomString() {
  let randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
}  

const getUserByEmail = function (email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return false
}

const urlsForUser = function (userID) {
  let obj = {};
  for (const data in urlDatabase) {
    if(userID === urlDatabase[data].userID) {
      obj[data] = urlDatabase[data];
    }
  }
  return obj;
}

const validateShortURLForUser = function(userId, shortUrl,urlsDB) {
  const userURLs = urlsForUser(userId,urlsDB);
  for (let key of Object.keys(userURLs)) {
    if (shortUrl === key)
      return {data : key};
  }
  return {data: null};
};
