const express = require("express");
const { getInfo } = require("./controllers/base_controller.js");
const app = express();
const { getCategories, postCategory } = require("./controllers/categories_controller.js");
const { deleteComment, patchComment } = require("./controllers/comments_controller.js");
const apiRouter = require("./routes/api-router.js");
const reviewsRouter = require("./routes/reviews-router.js");
const usersRouter = require("./routes/users-router.js");

app.use(express.json());

app.get("/api", getInfo);

app.use("/api", apiRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/users", usersRouter);

app.get("/api/categories", getCategories);
app.post("/api/categories", postCategory);

app.delete("/api/comments/:comment_id", deleteComment);
app.patch("/api/comments/:comment_id", patchComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

//custom error
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

//final error
app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500).send("Internal Server Error");
});

module.exports = app;
