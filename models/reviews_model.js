const { id } = require("prelude-ls");
const db = require("../db/connection.js");
const { checkExists } = require("../utils/utils.js");

exports.selectReviews = (sort_by = "created_at", category, order = "desc") => {
  order = order.toUpperCase();
  if (order !== "ASC" && order !== "DESC") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  const sort_by_headers = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];

  if (!sort_by_headers.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  if (sort_by === "comment_count") {
    sort_by = "counts." + sort_by;
  } else {
    sort_by = "reviews." + sort_by;
  }

  let queryStr = `SELECT reviews.owner, reviews.title, reviews.review_id,
  reviews.category, reviews.review_img_url, reviews.created_at,
  reviews.votes, reviews.designer, counts.comment_count FROM reviews
  LEFT JOIN (SELECT review_id, COUNT(review_id) as comment_count FROM reviews
  GROUP BY review_id) as counts
  ON counts.review_id = reviews.review_id`;

  const categories = ["euro game", "social deduction", "dexterity", "children's games"];

  if (category) {
    if (!categories.includes(category)) {
      return Promise.reject({
        status: 404,
        msg: "Resource not found",
      });
    }
    if (category === "children's games") {
      category = "children''s games";
    }
    queryStr += ` WHERE reviews.category = '${category}'`;
  }
  return db.query(`${queryStr} ORDER BY ${sort_by} ${order};`).then((reviews) => reviews.rows);
};

exports.selectReview = (review_id) => {
  if (isNaN(review_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return db
    .query(
      `SELECT 
      reviews.review_id, reviews.title, reviews.review_body,
      reviews.designer, reviews.review_img_url, reviews.votes,
      reviews.category, reviews.owner, reviews.created_at,
      COUNT(comments.review_id)::INT as comment_count
      FROM reviews
      LEFT JOIN comments ON reviews.review_id = comments.review_id
      WHERE reviews.review_id = ${review_id}
      GROUP BY reviews.review_id;`
    )
    .then((review) => {
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

exports.updateReview = (review_id, updatedReview) => {
  if (!updatedReview.hasOwnProperty("inc_votes")) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  const { inc_votes } = updatedReview;
  if (isNaN(review_id) || isNaN(inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return db.query(`UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *`, [inc_votes, review_id]);
    })
    .then((comments) => {
      return comments.rows[0];
    });
};

exports.insertReview = (newReview) => {
  if (
    !newReview.hasOwnProperty("owner") ||
    !newReview.hasOwnProperty("title") ||
    !newReview.hasOwnProperty("review_body") ||
    !newReview.hasOwnProperty("designer") ||
    !newReview.hasOwnProperty("category")
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  const { owner, title, review_body, designer, category } = newReview;
  if (!owner || !title || !review_body || !designer || !category) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return checkExists("users", "username", owner).then(() => {
    return checkExists("categories", "slug", category).then(() => {
      return db
        .query(
          `INSERT INTO reviews
        (title, category, designer, owner, review_body, created_at, votes) VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
          [title, category, designer, owner, review_body, new Date(), 0]
        )
        .then((review) => {
          const id = review.rows[0].review_id;
          return this.selectReview(id);
        });
    });
  });
};
