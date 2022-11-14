const db = require("../db/connection.js");

exports.selectReviews = () => {
  return db
    .query(
      `SELECT reviews.owner, reviews.title, reviews.review_id,
  reviews.category, reviews.review_img_url, reviews.created_at,
  reviews.votes, reviews.designer, counts.comment_count FROM reviews
  LEFT JOIN (SELECT review_id, COUNT(review_id) as comment_count FROM reviews
  GROUP BY review_id) as counts
  ON counts.review_id = reviews.review_id;`
    )
    .then((reviews) => reviews.rows);
};
