var mongoose = require('mongoose');
var config = require('../config');

console.log(config);

// create a user model
var userSchema = new mongoose.Schema({
  name: String,
  email: {type: String, lowercase: true }
});

module.exports = mongoose.model('User', userSchema);