
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ripta = require('./modules/ripta.js');

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

app.get('/', routes.index);
app.get('/sms', function(req, res){
	if(req.query.text && req.query.msisdn){
		var msg = req.query.text.toLowerCase();
		var number = req.query.msisdn;
		ripta.run(msg, number);
	} else {
		console.log("no query");
	}
	//ripta.run("thayer 92 in 20:00");
	res.writeHead(200);
	res.end();
});
app.get('/get', function(req, res){
	ripta.getReq(req, res);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
