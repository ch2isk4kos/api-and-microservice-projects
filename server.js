// init project
var bodyParser = require("body-parser");
var cors = require("cors");
var dns = require("dns");
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
// app.use(bodyParser.json()); // parse application/json
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

// URL Shortener Microservice v1
// var ShortURL = mongoose.model(
//   "ShortURL",
//   new mongoose.Schema({
//     original_url: String,
//     short_id: String,
//     short_url: String,
//   })
// );
// *****************************************************

// var urlSchema = new mongoose.Schema({
//   short_url: String,
//   original_url: String,
//   suffix: String,
// });

// var ShortURL = mongoose.model("ShortURL", urlSchema);

// *****************************************************
// app.post("/api/shorturl/new", function (req, res) {
//   console.log("req.body:", req.body);

//   let original_url = req.body.url;
//   let suffix = shortid.generate();
//   console.log("original_url:", original_url);
//   console.log("shortid:", suffix);

//   let document = new ShortURL({
//     short_url: `/api/shorturl/${suffix}`,
//     original_url: original_url,
//     suffix: suffix,
//   });

//   document.save((err, doc) => {
//     if (err) console.log(`Error Saving Document: ${err.message}`);
//     res.json({
//       isSaved: true,
//       short_url: document.short_url,
//       original_url: document.original_url,
//       suffix: document.suffix,
//     });
//     console.log("Document persisted successfully");
//   });
// });

// app.get("/api/shorturl/:suffix", function (req, res) {
//   let suffix = req.params.suffix;
//   ShortURL.find({ suffix: suffix })
//     .then((urls) => {
//       let url = urls[0];
//       if (url) res.redirect(url.original_url);
//       else res.json({ error: "invalid url" });
//     })
//     .catch((err) =>
//       console.log(`Error Finding ShortURL Document: ${err.message}`)
//     );
// });

// URL Shortener Microservice v2
// var ShortURL = mongoose.model(
//   "ShortURL",
//   new mongoose.Schema({
//     original_url: String,
//     short_id: String,
//     short_url: String,
//   })
// );

// app.post("/api/shorturl", async (req, res) => {
//   let { url } = req.body;
//   console.log("req.body.url:", url);
//   let regex = /^https?:\/\//;

//   let host = url.replace(regex, "");
//   console.log("regex:", host);

//   // validate url
//   dns.lookup(host, (err, addrs, fam) => {
//     console.log("addresses:", addrs);
//     console.log("family:", fam);

//     if (err) console.log("error:", err.message);
//     if (err) res.json({ error: "invalid url" });
//     else {
//       let suffix = shortid.generate();

//       let document = new ShortURL({
//         original_url: url,
//         short_id: suffix,
//         short_url: `/api/shorturl/${suffix}`,
//       });

//       document.save((err, doc) => {
//         if (err) console.log(`Error Saving Document: ${err.message}`);

//         console.log("Document persisted successfully");
//         console.log(document);

//         return res.json({
//           isSaved: true,
//           original_url: document.original_url,
//           short_id: document.short_id,
//           short_url: document.short_url,
//         });
//       });
//     }
//   });
// });

// app.get("/api/shorturl/:id", async (req, res) => {
//   console.log("req.params:", req.params);
//   console.log("req.params.id:", req.params.id);
//   let id = req.params.id;
//   let document = await ShortURL.findOne({ short_id: id });

//   if (document) return res.redirect(document.original_url);
//   else return res.json({ error: "ERROR: cannot find document" });
// });

const urls = [];
let id = 0;

// URL Shortener Microservice v3
app.post("/api/shorturl", (req, res) => {
  let url = req.body;
  let regex = /^https?:\/\//;

  let host = url.replace(regex, "");
  console.log("url:", url);
  console.log("host:", host);

  // validate url
  dns.lookup(host, (err, addrs, fam) => {
    console.log("addresses:", addrs);
    console.log("family:", fam);

    if (err) {
      console.log("error:", err.message);
      return res.json({ error: "invalid url" });
    } else {
      const obj = {
        original_url: url,
        short_url: id++,
        // short_url: shortid.generate(),
      };

      urls.push(obj);
      console.log("urls:", urls);

      return res.json(obj);
    }
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  console.log("req.params:", req.params);

  let short_id = req.params.short_url;
  console.log("req.params.short_url:", short_id);

  // const url = urls.filter((u) => u.short_url === short_id);
  let url = urls.find((u) => u.short_url === parseInt(short_id));
  console.log("url:", url);

  if (url) return res.redirect(url.original_url);
  else return res.json({ error: "invalid url" });
});

// listen for requests :)
var listener = app.listen(PORT, () => {
  console.log("Listening on port " + listener.address().port);
});
