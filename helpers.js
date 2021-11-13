const generateRandomString = () => {
  let randomString = Math.random().toString(36).substr(2, 6);
  return randomString;
};

const urlsForUser = (userID, urlDatabase) => {
  console.log("URLDATABASE: ", urlDatabase);
  const filteredUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      filteredUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: userID
      };
    }
  }
  return filteredUrls;
};

const getUserByEmail = (email, users) => {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return false;
};

const userAlreadyExist = (email, usersDB) => {
  for (let user in usersDB) {
    if (usersDB[user]["email"] === email) return { error: "Email Exists" };
  }
  return { error: null };
};

const authenticateUserInfo = (email, password, usersDB) => {
  if (!email || email.trim() === "") return { error: "Invalid Email" };
  if (!password || password.trim() === "") return { error: "Invalid pasword" };
  const { error } = userAlreadyExist(email, usersDB);
  if (error) return { error: error };
  return { error: null };
};

module.exports = {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  userAlreadyExist,
  authenticateUserInfo,
};
