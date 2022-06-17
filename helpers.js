const getUserbyEmail = function (email, database) {
  for (let key in database) {
    let user = database[key];
    if (user.email === email) return user;
  }
};

module.exports = { getUserbyEmail };