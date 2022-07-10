// server.js
// where your node app starts

// init project
const express = require("express");

const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get("*", function (request, response) {
  if (request.url === "/") {
    response.sendFile(__dirname + "/views/index.html");
  }
});

// listen for requests :)
var listener = app.listen(process.env.port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
