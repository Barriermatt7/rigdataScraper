var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");

// Require all models
var axios = require("axios");
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

mongoose.connect(
  "mongodb://localhost/rigScraper",
  { useNewUrlParser: true }
);

// Routes
//load in all scraped articles
app.get("/", function(req, res) {
  db.Article.find({ saved: false }, function(err, data) {
    //rendering index.handlebars
    res.render("home",data); //res.render("index", objectToBeRenderedOnTheFront);
  });
});

//load in all saved articles
app.get("/saved", function(req, res) {
  db.Article.find({ saved: true }, function(err, data) {
    res.render("saved", { savedArticles: data });
  });
});
// A GET route for scraping the  website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://rigdata.com/rigdata-insights").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $("div.blogList_right_section").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("div.entry-summary")
        .text();
      result.author = $(this)
        .siblings("blogList_author_date")
        .children("span")
        .text();
      result.date = $(this)
        .siblings("blogList_author_date")
        .children("li")
        .text();
      result.saved = false;
      
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.json({message:"Scrape Complete"});
    
  });
});

//clear all articles from the db
app.get("/clearall", function(req, res) {
  db.Article.remove({})
    .then(function(data) {
      res.json({ message: "All Articles Cleared" });
    })
    .catch(function(err) {
      console.log(err);
    });
});
// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
      // res.render whatever page you want to show
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/", function(req, res) {
  //Testing route request
  console.log(req);
  // Create a new note and pass the req.body to the entry
  db.Article.create(req.body)
    .then(function(dbArticle) {
      //testing query
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.put("/articles/:id", function(req, res) {
  //Testing route request
  console.log(req);
  // Create a new note and pass the req.body to the entry
  db.Article.update(
    {
      _id: req.params.id
    },
    req.body
  )
    .then(resArticle => res.json(resArticle))
    .catch(err => console.error(err));
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
