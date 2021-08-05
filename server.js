// server.js: application entry point

// init project
var express = require("express");
var app = express();

var PORT = process.env.PORT || 3000;

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api", function (req, res) {
  // const now = new Date();
  const now = new Date();
  // console.log(now.toLocaleString());
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});

app.get("/api/hello", function (req, res) {
  console.log({ greeting: "hello API" });
  res.json({ greeting: "hello API" });
});

app.get("/api/:date_string", function (req, res) {
  const paramsDateString = req.params.date_string;
  const date = new Date(parseInt(paramsDateString));

  if (date === "Invalid Date") {
    res.json({ error: "Invalid Date" });
  } else {
    res.json({ unix: date.getTime(), utc: date.toUTCString() });
  }
});

// listen for requests :)
var listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
