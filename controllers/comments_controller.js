const { removeComment } = require("../models/comments_model");

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
};
