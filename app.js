const express = require("express");
const app = express();
const { getCategories } = require("./controllers/categories_controller.js");
const { getReviews } = require("./controllers/reviews_controller");

app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

//psql errors
// app.use((err, req, res, next) => {
//   if (err.code === "22P02") {
//     res.status(400).send({ msg: "Bad Request" });
//   } else {
//     next(err);
//   }
// });

// //custom error
// app.use((err, req, res, next) => {
//   if (err.status && err.msg) {
//     res.status(err.status).send({ msg: err.msg });
//   }
// });

// //final error
// app.use((err, req, res, next) => {
//   console.log(err);
//   res.sendStatus(500).send("Internal Server Error");
// });

module.exports = app;
