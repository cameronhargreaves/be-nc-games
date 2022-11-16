const db = require("../db/connection.js");
const { checkExists } = require("../utils/utils.js");

exports.removeComment = (comment_id) => {
  if (!isNaN(comment_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return checkExists("comments", "comment_id", comment_id).then(() => {
    return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id]);
  });
};
