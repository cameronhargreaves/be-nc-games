const endpoints = require("../endpoints.json");

exports.getInfo = (req, res, next) => {
  if (endpoints === undefined) {
    res.status(404).send({ msg: "file not found" });
  }
  res.status(200).send(endpoints);
};
