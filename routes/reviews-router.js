const {
  getReviews,
  getReview,
  getCommentsForReviewId,
  patchReview,
  postComment,
  postReview,
} = require("../controllers/reviews_controller");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter.route("/:review_id").get(getReview).patch(patchReview);

reviewsRouter.route("/:review_id/comments").get(getCommentsForReviewId).post(postComment);
module.exports = reviewsRouter;
