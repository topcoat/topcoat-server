/* Topcoat benchmark server */

var express = require('express')
  , fetch = require('./routes/fetch')
  , http = require('http')
  , mongoose = require('mongoose')
  , fs = require('fs')
  , schemes = require('./schemes')
  , path = require('path')
  , uaParser = require('ua-parser');

var app = express();
var db = mongoose.connect('mongodb://localhost:27017/topcoat');
//var db = mongoose.connect('mongodb://nodejitsu:9fc443c21383ecb58fbf5c05ae3d89b3@alex.mongohq.com:10059/nodejitsudb170514779432');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
	res.render('index', {
		title: 'Topcoat'
	});
});

app.get('/test/:file', fetch.file);

app.post('/benchmark', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	
	var ua = uaParser.parse(req.body.ua)
		, schema = schemes.test_scheme
		, Test = db.model('Test', schema);
	
	var test = new Test({
		result: req.body.benchmark_result,
		os: ua.os,
		version: ua.major,
		browser: ua.family,
		device : req.body.device,
		test: req.body.test,
		ua: req.body.ua
	});
	test.save(function (err) {
		if (err)
			console.log('error');
		else
			res.end('submitted');
	});
});

app.get('/view/db', function(req, res) {

	var schema = schemes.test_scheme;
	var Test = db.model('Test', schema);
	
	Test.find(function (err, docs) {
		if (err)
			console.log(err);
		else
			res.render('results', {
				title: 'Topcoat',
				results: docs
			});
	});
});

app.delete('/remove/db', function(req, res) {
	
	var ids = req.body.ids.split(',');
	var schema = schemes.test_scheme;
	var Test = db.model('Test', schema);

	ids.forEach(function(id){
		Test.findById(id, function(err, doc){
			if(err)
				console.log(err);
			else
				doc.remove(function(err, product){
					if(err) console.log(err);
					else console.log('product removed');
				});
		});
	});
});

app.get('/edit/db', function(req, res){
	
	res.end('Nothing to do here');
	return;
	
	var schema = schemes.test_scheme;
	var Test = db.model('Test', schema);

	Test.find(function (err, docs) {
		if (err)
			console.log(err);
		else
			res.render('edit', {
				title: 'Topcoat',
				results: docs
			});
	});
});

app.get('/view/results', function(req, res){

	var schema = schemes.test_scheme;
	var Test = db.model('Test', schema);
	
	Test.find().distinct('test', function(err, docs){
		if(err)
			console.log(err)
		else
			res.render('visualisations', {
				title: 'Visualisation menu',
				tests: docs
			})
	})

});

app.get('/view/results/:platform', function(req, res){
	res.render('graph',{
		title: 'Visualisation of results for ' + req.params.platform
	});
});

app.get('/json/:what/:value', function(req, res){

	var schema = schemes.test_scheme;
	var Test = db.model('Test', schema);
	var search = {};
	search[req.params.what] = req.params.value;
	Test.find(search)
		.select('test result browser device os version ua')
		.exec(function(err, docs){
			if(err)
				console.log(err);
			else
				if (!docs.length)
					res.end('Got nothin\'');
				else
					res.end(JSON.stringify(docs));
	});

});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});