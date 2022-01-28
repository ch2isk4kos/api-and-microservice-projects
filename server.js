// init project
var bodyParser = require("body-parser");
var cors = require("cors");
var express = require("express");
var mongoose = require("mongoose");
var shortid = require("shortid");
var app = express();
require("dotenv").config();

var PORT = process.env.PORT || 3000;
var MONGODB_URI = process.env.MONGODB_URI;

// DATABASE CONFIG
const mongooseConfigOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(MONGODB_URI, mongooseConfigOptions)
  .then(() => console.log("Connected to Atlas"))
  .catch((err) => console.log(`MONGO ATLAS ERROR: ${err.message}`));

// middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false })); // parse form(s)/input(s)
app.use(bodyParser.json()); // parse application/json
app.use(express.static("public"));

// CONTROLLER(s): http://expressjs.com/en/starter/basic-routing.html
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

// Timestamp Microservice
app.get("/api/timestamp", function (req, res) {
  const now = new Date();
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});

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
var ShortURL = mongoose.model(
  "ShortURL",
  new mongoose.Schema({
    shortURL: String,
    postedURL: String,
    suffix: String,
  })
);

// var urlSchema = new mongoose.Schema({
//   shortURL: String,
//   postedURL: String,
//   suffix: String,
// });

// var ShortURL = mongoose.model("ShortURL", urlSchema);

app.post("/api/shorturl/new", function (req, res) {
  console.log("req.body:", req.body);

  let postedURL = req.body.url;
  let suffix = shortid.generate();
  console.log("postedURL:", postedURL);
  console.log("shortid:", suffix);

  let document = new ShortURL({
    shortURL: `/api/shorturl/${suffix}`,
    postedURL,
    suffix,
  });

  document.save((err, doc) => {
    if (err) console.log(`Error Saving Document: ${err.message}`);
    res.json({
      isSaved: true,
      shortURL: document.shortURL,
      postedURL: document.postedURL,
      suffix: document.suffix,
    });
    console.log("Document persisted successfully");
  });
});

app.get("/api/shorturl/:suffix", function (req, res) {
  let suffix = req.params.suffix;
  ShortURL.find({ suffix: suffix })
    .then((urls) => {
      let url = urls[0];
      res.redirect(url.postedURL);
    })
    .catch((err) =>
      console.log(`Error Finding ShortURL Document: ${err.message}`)
    );
});

// listen for requests :)
var listener = app.listen(PORT, function () {
  console.log("Listening on port " + listener.address().port);
});
