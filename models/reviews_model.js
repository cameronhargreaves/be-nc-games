const db = require("../db/connection.js");
const { checkExists } = require("../utils/utils.js");

exports.selectReviews = () => {
  return db
    .query(
      `SELECT reviews.owner, reviews.title, reviews.review_id,
  reviews.category, reviews.review_img_url, reviews.created_at,
  reviews.votes, reviews.designer, counts.comment_count FROM reviews
  LEFT JOIN (SELECT review_id, COUNT(review_id) as comment_count FROM reviews
  GROUP BY review_id) as counts
  ON counts.review_id = reviews.review_id
  ORDER BY reviews.created_at DESC;`
    )
    .then((reviews) => reviews.rows);
};

exports.selectReview = (review_id) => {
  if (isNaN(review_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return db.query(`SELECT * FROM reviews WHERE review_id = ${review_id}`).then((review) => {
    if (review.rows.length < 1) {
      return Promise.reject({
        status: 404,
        msg: "Review Not Found",
      });
    }
    return review.rows[0];
  });
};

exports.selectCommentsForReviewId = (review_id) => {
  if (isNaN(review_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return db.query(`SELECT * FROM comments WHERE review_id = ${review_id}`);
    })
    .then((comments) => {
      return comments.rows;
    });
};

exports.insertComment = (review_id, newComment) => {
  if (isNaN(review_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  if (!newComment.hasOwnProperty("body") || !newComment.hasOwnProperty("username")) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  const { username, body } = newComment;
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return checkExists("users", "username", username);
    })
    .then(() => {
      return db.query(
        "INSERT INTO comments (votes, created_at, author, body, review_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [0, new Date(), username, body, review_id]
      );
    })
    .then((comment) => {
      return comment.rows[0];
    });
};
