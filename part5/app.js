/////////////////////////////
////    server side     ////
///////////////////////////

// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose')
var config = require('./config');
var routes = require('./routes');
var passport = require('./authentication');

var app = express();

// connect to the database
mongoose.connect(config.mongoUrl);

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

// user routes
app.get('/', routes.index);
app.get('/search', ensureAuthenticated, routes.search);
app.get('/searching', ensureAuthenticated, routes.searching);
app.get('/save', ensureAuthenticated, routes.save)
app.get('/logout', function(req, res){
  req.logOut();
  res.redirect('/');
});

// auth routes
app.get('/auth/google',
  passport.authenticate('google'),
  function(req, res){
});
app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/search');
  }
);

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

// run server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});