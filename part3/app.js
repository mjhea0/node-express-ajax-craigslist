/////////////////////////////
////    server side     ////
///////////////////////////

// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var request = require('request');
var mongoose = require('mongoose')
var passport = require('passport')
var GoogleStrategy = require('passport-google').Strategy;
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// connect to the database
mongoose.connect('mongodb://localhost/craigslist');

// create a user model
var User = mongoose.model('User', {
  oauthID: Number,
});

// serialize and deserialize
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id)
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    console.log(user)
    if(!err) done(null, user);
    else done(err, null)
  })
});

// config
passport.use(new GoogleStrategy({
	returnURL: 'http://127.0.0.1:3000/auth/google/callback',
 	realm: 'http://127.0.0.1:3000'
},
function(accessToken, refreshToken, profile, done) {
User.findOne({ oauthID: profile.id }, function(err, user) {
 if(err) { console.log(err); }
 if (!err && user != null) {
   done(null, user);
 } else {
   console.log(profile)
   var user = new User({
     oauthID: profile.id,
     created: Date.now()
   });
   user.save(function(err) {
     if(err) {
       console.log(err);
     } else {
       console.log("saving user ...");
       done(null, user);
     };
   });
 };
});
}
));


// routes
app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/search', ensureAuthenticated, function(req, res){
  User.findById(req.session.passport.user, function(err, user) {
    if(err) {
      console.log(err);
    } else {
      res.render('search', { user: user});
    };
  });
});

app.get('/searching', function(req, res){
	// input value from search
	var val = req.query.search;
	// url used to search yql
	var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20craigslist.search" +
	"%20where%20location%3D%22sfbay%22%20and%20type%3D%22jjj%22%20and%20query%3D%22" + val + "%22&format=" +
	"json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

	requests(url,function(data){
		res.send(data);
	});
});

app.get('/auth/google',
  passport.authenticate('google'),
  function(req, res){
});
app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/search');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function requests(url, callback) {
	// request module is used to process the yql url and return the results in JSON format
	request(url, function(err, resp, body) {
		var resultsArray = [];
		body = JSON.parse(body);
		// console.log(body.query.results.RDF.item)
		// logic used to compare search results with the input from user
		if (!body.query.results.RDF.item) {
		  results = "No results found. Try again.";
		  callback(results);
		} else {
			results = body.query.results.RDF.item;
			for (var i = 0; i < results.length; i++) {
				resultsArray.push(
					{title:results[i].title[0], about:results[i]["about"], desc:results[i]["description"]}
				);
			};
		};
	  // pass back the results to client side
	  callback(resultsArray);
	});
};

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

// run server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

