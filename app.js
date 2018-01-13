// defining app dependencies
// express is a node.js framework used for server-side javascript
var express = require('express'),
    // execute the express webserver
    app = express(),
    // analyze as URL encoded data
    bodyParser = require('body-parser'),
    // templating engine to help display static web pages
    engines = require('consolidate'),
    // connect to mongo shell
    // connect to mongo database using uri
    // Pattern is mongodb://{hostname}:{port}/{dbname}
    MongoClient = require('mongodb').MongoClient,
    // allow tests to be written, fail, pass, etc
    assert = require('assert');

var database;

// use templating engine to render files with html extensions using nunjucks library
app.engine('html', engines.nunjucks);

// middleware to serve static files(css, javascript) into the application
// app.use(express.static(__dirname + 'public'));

// set where the view templates are located
// ___dirname allows full path to directory to views
app.set('views', __dirname + '/views');

// parse text as URL encoded data(how browsers tend to send data from regular forms set to post)
// data is exposed on a resulting object on req.body
app.use(bodyParser.urlencoded({
    extended: true
}));

// parse data as a json object
app.use(bodyParser.json());

MongoClient.connect('mongodb://127.0.0.1:27017/video', function (err, db) {

    // if error display
    if (err) throw err;

    database = db.db('video');
    console.log("Successfully connected to mongoDB!");

    // route handler for the root route takes in a callback function to handle request and response objects
    app.get('/', function(req, res) {

      // tell express which template engine to use to render the html file (use engines.nunjucks function)
      app.set('entries-form', 'html');

      // render collection in view-entries page
      res.render('entries-form.html');
    });

    // post request from the root home
    app.post('/', function(req, res) {

      var movie_title = req.body.movie.title;
      var movie_year = req.body.movie.year;
      var movie_imdb = req.body.movie.imdb;

      console.log(req.body);

      database.collection('movies').insertOne(
        {
        "title": movie_title,
        "year": movie_year,
        "imdb": movie_imdb
        },
        function (err, response) {
          if (err) throw err;
          console.log("Document added: " + response.insertedId);
        }
      );

      // query all collections in movies and render view-entries template;
      database.collection('movies').find({}).toArray(function(err, docs) {

        // if any errors, display errorm essage
        if (err) throw err;

        app.set('view-entries', 'html');

        // render collection in view-entries page
        res.render('view-entries.html', { 'movies': docs } );

      });
    });

    // if any route handlers fail, this error handler will run instead
    app.use(function(req, res) {

      // not found status will be sent back
      res.sendStatus(404);
    });
  });

// listen for client connections (local host port)
// execute a callback function that logs the server is listening
var server = app.listen(27017, function(){

  // save port number
  var port = server.address().port;
  console.log('Express server is listening on port %s', port);
});
