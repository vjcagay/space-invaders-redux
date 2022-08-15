// server.js
// where your node app starts

// init project
const express = require("express");
const sassMiddleware = require("node-sass-middleware");

const app = express();

app.use(
  sassMiddleware({
    src: __dirname + "/public",
    dest: "/tmp",
  })
);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.static("/tmp"));

app.get("*", function (request, response) {
  if (request.url === "/") {
    response.sendFile(__dirname + "/views/index.html");
  }
});

// listen for requests :)
var listener = app.listen(8000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
