/**
 *
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var express = require('express')
  , mongoose = require('mongoose')
  , schemes = require('./schemes')
  , path = require('path')
  , uaParser = require('ua-parser')
  , url = require('url')
  , parser = require('./lib/parser')
  ;

var app = express();
var db;

if(process.env.PORT) { // switch between local and production env
	db = mongoose.connect('mongodb://ec2-54-245-99-50.us-west-2.compute.amazonaws.com/topcoat');
	console.log('Connected to amazondb');
} else {
	db = mongoose.connect('mongodb://localhost:27017/topcoat');
	console.log('Fallback to localdb');
}

var benchmark = require('./routes/benchmark')(db);

app.configure(function () {
  app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.locals.pretty = true;
});

app.get('/', function(req, res){

	res.render('index', {
		layout : 'landing-layout.jade',
		title : 'Topcoat Server'
	});

});

app.get('/view/effeckt', function(req, res){

	res.render('index-effeckt', {
		title : 'Topcoat Server'
	});

});

app.get('/baseline', function(req, res){
	console.log('baseline');
	res.render('baseline', {
		layout : 'none',
		title : 'Topcoat Server'
	});

});

app.post('/v2/benchmark', benchmark.add);

app.get('/dashboard', function (req, res) {

	var params = req.url.split('&');
	var query = parser.query(url.parse(req.url).query);

	res.render('dashboard.jade', {
		'title'  : 'Topcoat Server',
		'test'   : query.test,
		'device' : unescape(query.device)
	});

});

	app.post('/dashboard/get', benchmark.get);


app.get('/view/results', benchmark.viewResults);

	app.post('/remove', function (req, res) {

		var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
		,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
		,	ua = uaParser.parse(req.body.ua)
		;

		var findAndRemove = [];

		for (var i in req.body)
			findAndRemove.push(req.body[i]);

		TelemetryAvg.find({'_id' : { $in : findAndRemove }}).remove(function(){
			res.end('Removed!');
		});

	});

		app.post('/remove/test', benchmark.removeTest);

app.post('/view/results/filtered', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	,	query
	;

	var query = parser.urlQuery(req.body);
	TelemetryAvg.find(query).sort('-test -date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			res.render('table-fragment', {
				layout  : false,
				results : docs
			});
		}
	});

});

app.post('/compare', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	;

	var ids = [];
	for(var i in req.body)
		ids.push(req.body[i]);
	TelemetryAvg.find({_id : { $in: ids }}, function (err, docs) {
		if(err) {
			console.log(err);
			res.end('Error');
		} else {
			res.render('compare', {
				title : 'Topcoat Server',
				results: docs
			});

		}

	});

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});