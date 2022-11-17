const { selectCategories, insertCategory } = require("../models/categories_model");

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch(next);
};

exports.postCategory = (req, res, next) => {
  const newCategory = req.body;
  insertCategory(newCategory)
    .then((category) => {
      res.status(201).send({ category });
    })
    .catch(next);
};
