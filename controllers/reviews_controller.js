const {
  selectReviews,
  selectReview,
  selectCommentsForReviewId,
  insertComment,
  updateReview,
  insertReview,
  removeReview,
} = require("../models/reviews_model");

exports.getReviews = (req, res, next) => {
  const { sort_by, category, order, limit, p } = req.query;
  selectReviews(sort_by, category, order, limit, p)
    .then((reviews) => {
      res.status(200).send({ reviews: reviews, total_count: reviews.length });
    })
    .catch(next);
};

exports.getReview = (req, res, next) => {
  const { review_id } = req.params;
  selectReview(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.getCommentsForReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const { limit, p } = req.query;
  selectCommentsForReviewId(review_id, limit, p)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { review_id } = req.params;
  const newComment = req.body;
  insertComment(review_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchReview = (req, res, next) => {
  const { review_id } = req.params;
  const updatedVotes = req.body;
  updateReview(review_id, updatedVotes)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.postReview = (req, res, next) => {
  const newReview = req.body;
  insertReview(newReview)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch(next);
};

exports.deleteReview = (req, res, next) => {
  const { review_id } = req.params;
  removeReview(review_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
};
