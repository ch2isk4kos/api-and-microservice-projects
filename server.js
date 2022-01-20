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

// CONTROLLER(s)
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/timestamp-microservice", function (req, res) {
  res.sendFile(__dirname + "/views/timestamp.html");
});

app.get("/request-header-parser-microservice", function (req, res) {
  res.sendFile(__dirname + "/views/requestHeaderParser.html");
});

app.get("/url-shortener-microservice", function (req, res) {
  res.sendFile(__dirname + "/views/urlShortener.html");
});

// API ROUTE(s)
// your first API endpoint...
app.get("/api/timestamp", function (req, res) {
  const now = new Date();
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});

// Timestamp Microservice
app.get("/api/timestamp/:date_string", function (req, res) {
  let str = req.params.date_string;
  let s = parseInt(str);

  if (s > 10000) {
    let ut = new Date(s);
    res.json({
      unix: ut.getTime(),
      utc: ut.toUTCString(),
    });
  }

  let date = new Date(str);

  if (date == "Invalid Date") {
    res.json({ error: "Invalid Date" });
  } else {
    res.json({
      unix: date.getTime(),
      utc: date.toUTCString(),
    });
  }
});

// Request Header Parse Microservice
app.get("/api/whoami", function (req, res) {
  res.json({
    ipaddress: req.connection.remoteAddress,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

// URL Shortener Microservice
app.get("/api/shorturl", function (req, res) {
  res.json({
    value: "Something here...",
  });
});

// listen for requests :)
var listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
