const getUserByUserId = function (user_id, users) {
  const user = users[user_id];
  return user;
};

const getUserbyEmail = function (email, database) {
  for (let key in database) {
    let user = database[key];
    if (user.email === email) return user;
  }
};

const generateRandomString = function() {
  const randNum = Math.random() + 1;
  return randNum.toString(36).substring(5);
}

const getShortUrlByUserId = function (id, database) {
  let shortUrls = [];
  const keys = Object.keys(database);
  keys.forEach((key) => {
    if (database[key].userId === id) {
      shortUrls.push(key);
    }
  });
  return shortUrls;
};

module.exports = { getUserByUserId, getUserbyEmail, generateRandomString, getShortUrlByUserId };