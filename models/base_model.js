const endpoints = require("../endpoints.json");

exports.selectInfo = () => {
  //   console.log(endpoints);
  //   return endpoints;
  console.log("insdie");
  fetch("../endpoints.json")
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((json) => {
      console.log("json");
      console.log(json);
      return json;
    })
    .catch((err) => {
      console.log("error");
    });
};
