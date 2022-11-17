const db = require("../db/connection.js");
const { checkExists } = require("../utils/utils.js");

exports.selectUsers = () => {
  console.log("inside model");
  return db.query(`SELECT * FROM USERS;`).then((users) => {
    return users.rows;
  });
};

exports.selectUser = (username) => {
  return checkExists("users", "username", username).then(() => {
    return db.query(`SELECT * FROM users WHERE username = $1`, [username]).then((result) => {
      return result.rows[0];
    });
  });
};
