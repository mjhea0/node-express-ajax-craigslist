/////////////////////////////
////    server side     ////
///////////////////////////

// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose')
var passport = require('passport')
var GoogleStrategy = require('passport-google').Strategy;
var config = require('./config');
var user = require('./models/user');
var routes = require('./routes');

var app = express();

// connect to the database
mongoose.connect(config.mongoUrl);

// passport settings
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user.id)
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  user.findOne({_id : id}, function(err, user) {
    console.log(user)
    if(!err) done(null, user);
    else done(err, null)
  });
});

passport.use(new GoogleStrategy({
  returnURL: config.google.returnURL,
  realm: config.google.realm
},
  function(identifier, profile, done) {
    console.log(profile.emails[0].value)
    process.nextTick(function() {
      var query = user.findOne({'email': profile.emails[0].value});
      query.exec(function(err, oldUser) {
        if(oldUser) {
          console.log("Found registered user: " + oldUser.name + " is logged in!");
          done(null, oldUser);
        } else {
          var newUser = new user();
          newUser.name = profile.displayName;
          newUser.email = profile.emails[0].value;
          console.log(newUser);
          newUser.save(function(err){
            if(err){
              throw err;
            }
            console.log("New user, " + newUser.name + ", was created");
            done(null, newUser);
          });
        }
      });
    });
  }
));

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

