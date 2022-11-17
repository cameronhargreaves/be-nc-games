const { getInfo } = require("./controllers/base_controller.js");
const apiRouter = require("express").Router();
// /api

apiRouter.get("", getInfo);
apiRouter.get("/health", (req, res) => {
  res.status(200).send({ msg: "server up and running" });
});
module.exports = apiRouter;
