/////////////////////////////
////    server side     ////
///////////////////////////

// var routes = require('./routes');
// var user = require('./routes/user');

// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var request = require('request');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// first route
app.get('/', function(req, res) {res.render('index')});

// second route
app.get('/searching', function(req, res){

	// input value from search
	var val = req.query.search;
	//console.log(val);

	// url used to search yql
	var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20craigslist.search" +
	"%20where%20location%3D%22sfbay%22%20and%20type%3D%22jjj%22%20and%20query%3D%22" + val + "%22&format=" +
	"json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	// console.log(url);

	// request module is used to process the yql url and return the results in JSON format
	request(url, function(err, resp, body) {
		body = JSON.parse(body);
		// logic used to compare search results with the input from user
		// console.log(!body.query.results.RDF.item['about'])
		if (!body.query.results.RDF.item) {
		  craig = "No results found. Try again.";
		} else {
			results = body.query.results.RDF.item[0]['about']
	    craig = '<a href ="'+results+'">'+results+'</a>'
	  }
	  // pass back the results to client side
		res.send(craig);
	});

	// testing the route
	// res.send("WHEEE");

});

// old routes
// app.get('/', routes.index);
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
