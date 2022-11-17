const { removeComment, updateComment } = require("../models/comments_model");

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const newVotes = req.body;
  updateComment(comment_id, newVotes)
    .then(() => {
      res.status(200).end();
    })
    .catch(next);
};
