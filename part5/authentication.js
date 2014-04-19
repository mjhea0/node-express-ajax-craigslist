// authentication 

var passport = require('passport')
var GoogleStrategy = require('passport-google').Strategy;
var config = require('./config');
var user = require('./models/user');

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

module.exports = passport;