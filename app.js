
/**
 * Module dependencies.
 */

var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');

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

app.get('/', function(req, res) {res.render('index')});

app.get('/searching', function(req, res){
console.log(val)
// YQL 
var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20craigslist.search" +
"%20where%20location%3D%22sfbay%22%20and%20type%3D%22jjj%22%20and%20query%3D%22" + val + "%22&format=" +
"json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
craig = []
if(data.query.count === 0 || typeof data.query.results.RDF.item === 'undefined') {
    craig = "No results found. Try again."
} else {
    for (var i = 0; i < data.query.results.RDF.item.length; i++) {
            craig = data.query.results.RDF.item[i].title[0]
    }
}

res.send(craig);
        })



// app.get('/', routes.index);
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
