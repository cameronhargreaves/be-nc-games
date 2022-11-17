const db = require("../db/connection.js");

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories").then((categories) => categories.rows);
};

exports.insertCategory = (newCategory) => {
  if (!newCategory.hasOwnProperty("slug") || !newCategory.hasOwnProperty("description")) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  const { slug, description } = newCategory;
  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return db.query(`INSERT INTO categories VALUES ($1, $2) RETURNING *`, [slug, description]).then((category) => {
    return category.rows[0];
  });
};
