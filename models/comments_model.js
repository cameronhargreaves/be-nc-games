const db = require("../db/connection.js");
const { checkExists } = require("../utils/utils.js");

exports.removeComment = (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return checkExists("comments", "comment_id", comment_id).then(() => {
    return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id]);
  });
};

exports.updateComment = (comment_id, newVotes) => {
  if (!newVotes.hasOwnProperty("inc_votes")) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  const { inc_votes } = newVotes;
  if (isNaN(comment_id) || isNaN(inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return checkExists("comments", "comment_id", comment_id).then(() => {
    return db
      .query(`UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`, [inc_votes, comment_id])
      .then((comment) => {
        return comment.rows[0];
      });
  });
};
