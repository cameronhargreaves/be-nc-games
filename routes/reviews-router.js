const {
  getReviews,
  getReview,
  getCommentsForReviewId,
  patchReview,
  postComment,
  postReview,
  deleteReview,
} = require("../controllers/reviews_controller");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter.route("/:review_id").get(getReview).patch(patchReview).delete(deleteReview);

reviewsRouter.route("/:review_id/comments").get(getCommentsForReviewId).post(postComment);
module.exports = reviewsRouter;
