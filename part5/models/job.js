var mongoose = require('mongoose');
var config = require('../config');
var user = require('../models/user');

console.log(config);

// create a jobs model
var jobSchema = new mongoose.Schema({
  title: String,
  url: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: user}
});

module.exports = mongoose.model('Job', jobSchema);