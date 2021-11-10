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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
   console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: req.params.longURL
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
  const newUrl = Math.random().toString(36).substr(2, 6);
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
  res.redirect('/urls'); 
});

// Add Login Route
app.get("/login", (req,res) => {
})

app.post("/login", (req, res) => {
  //console.log("hello" + req.body.username);
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

// POST for Logout
app.post("/logout", (req, res) => {
  console.log("logout");
  res.clearCookie("username");
  res.redirect("/urls");
})



// app.get("/", (req, res) => {
//   res.send("Hello");
// })

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
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



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

function generateRandomString() {
  let random = '';
  let result = [];

  for ( let i = 0; i < 5 ; i++ ) {
    random += Math.random().toString(36).substr(2, 6);
    result.push(random);
    random = '';    
  }
  //console.log(result);
  return result.toString();
}  