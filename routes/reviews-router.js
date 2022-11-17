const {
  getReviews,
  getReview,
  getCommentsForReviewId,
  patchReview,
  postComment,
} = require("../controllers/reviews_controller");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);

reviewsRouter.route("/:review_id").get(getReview).patch(patchReview);

reviewsRouter.route("/:review_id/comments").get(getCommentsForReviewId).post(postComment);
module.exports = reviewsRouter;
