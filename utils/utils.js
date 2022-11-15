const format = require("pg-format");
const db = require("../db/connection.js");

const checkExists = (table, column, value) => {
  // %I is an identifier in pg-format
  // %L is an SQL literal in pg-format (as you've seen for an array of values)
  const queryStr = format("SELECT * FROM %I WHERE %I = %L;", table, column, value);
  return db.query(queryStr).then((res) => {
    if (res.rows.length === 0) {
      // resource does NOT exist
      return Promise.reject({ status: 404, msg: "Resource not found" });
    }
  });
};

module.exports = { checkExists };
