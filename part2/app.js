/////////////////////////////
////    server side     ////
///////////////////////////

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
	// url used to search yql
	var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20craigslist.search" +
	"%20where%20location%3D%22sfbay%22%20and%20type%3D%22jjj%22%20and%20query%3D%22" + val + "%22&format=" +
	"json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

	requests(url,function(data){
		res.send(data);
	});
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

// run server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
