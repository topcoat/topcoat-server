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
// var db = mongoose.connect('mongodb://localhost:27017/topcoat');
var db = mongoose.connect('mongodb://nodejitsu:9fc443c21383ecb58fbf5c05ae3d89b3@alex.mongohq.com:10059/nodejitsudb170514779432');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.locals.pretty = true;
});

app.get('/', function(req, res){
	res.render('index', {
		title: 'Topcoat'
	});
});

app.get('/create', function (req, res) {
	
	var schema = schemes.test_scheme
	,	Test = db.model('Test', schema);
	
	Test.find().distinct('commit', function(err, docs){
		if(err)
			console.log(err);
		else {
			var l = docs.length;
			docs.forEach(function (commit) {
				Test.findOne({'commit' : commit}, function (err, doc) {
					var commitSchema = schemes.commitSchema
					,	Commit = db.model('Commit', commitSchema);

					var commitEntry = new Commit({
						commit  : commit,
						date	: doc.date
					});

					commitEntry.save(function (err) {
						if(err) {
							console.log(err);
							res.end('Error!');
						} else {
							console.log('saved');
							if(--l === 0) {
								res.end('Done');
							}
						}
					});

				});
			});
		}
	});

});

app.post('/benchmark', function (req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	
	var ua = uaParser.parse(req.body.ua)
	,	schema = schemes.test_scheme
	,	selector = schemes.selector
	,	Selector = db.model('Selector', selector)
	,	Test = db.model('Test', schema);

	var test = new Test({
		result: req.body.benchmark_result,
		commit : req.body.commit,
		date : req.body.date,
		os: ua.os.toString(),
		//version: ua.toVersionString(), //not working due to a bug in the latest ua-parser
		version: ua.major + "." + ua.minor + "." + ua.patch,
		browser: ua.family,
		device : req.body.device,
		test: req.body.test,
		ua: req.body.ua
	});

	if(req.body.selector && req.body.selector.length)
		req.body.selector.forEach(function (sel) {
			var s = new Selector({
				delta: sel.delta,
				selector: sel.selector,
				total: sel.total
			});
			test.selector.push(s);
		});
	
	test.save(function (err) {
		if (err)
			res.end('Error');
		else
			res.end('Submitted');
	});
});

app.post('/v2/benchmark', function (req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	req.body = JSON.parse(req.body.data);

	console.log(req.body);

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua || req.body.resultName['UserAgent ()'])
	;

	var telemetryTest = new TelemetryTest({
			ua     : req.body.resultName['UserAgent ()']
		,	device : req.body.device
		,	os 	   : ua.os.toString()
		,	browser: ua.family
		,	version: ua.major + "." + ua.minor + "." + ua.patch
		,	commit : req.body.commit
		,	date   : req.body.date
		,	result : {}
		,	test   : req.body.test
	});

	for(var i in req.body.resultName) {
		telemetryTest.result[i] = req.body.resultName[i];
	}

	telemetryTest.save(function (err) {
		if(err) {
			console.log('Error saving result');
		}
	});

	TelemetryAvg.findOne({
		commit   : req.body.commit,
		platform : ua.family + ' ' + ua.major + "." + ua.minor + "." + ua.patch + ' ' + ua.os.toString(),
		test     : req.body.test,
		device   : req.body.device
	}, function (err, doc) {
		if (err) {
			console.log('Error : ', err);
		} else {
			if (!doc) {
				var telemetryAvg = new TelemetryAvg({
					result   : telemetryTest.result,
					commit   : req.body.commit,
					date 	 : req.body.date,
					platform : ua.family + ' ' + ua.major + "." + ua.minor + "." + ua.patch + ' ' + ua.os.toString(),
					test     : req.body.test,
					device   : req.body.device,
					count	 : 1,
					ua       : telemetryTest.ua
				});
				telemetryAvg.save(function (err) {
					if(err) console.log('err', err);
				});
				res.end('Result saved. New result');
			} else {
				var update = {};
				for(var i in req.body.resultName) {
					if (!isNaN(parseFloat(req.body.resultName[i]))) {
						update[i] = (parseFloat(doc.result[i]) * doc.count + parseFloat(req.body.resultName[i])) / (doc.count+1);
					} else {
						update[i] = req.body.resultName[i];
					}
				}
				
				doc.result = update;
				doc.count += 1;
				doc.save();
				res.end('Result saved. Average updated');
			}
		}
	});

});

app.get('/v2/view/results', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	;
	
	var date = {
		date : {
			$gte: new Date(new Date().getTime() - 7*86400*1000).toISOString()
		}
	};

	TelemetryAvg.find(date).sort('-date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
				docs[idx].miliseconds = date.getTime();
			});
			console.log(docs);
			res.render('telemetry-average', {
				title : 'telemetry average',
				results: docs
			});
		}
	});

});

app.post('/v2/view/results/filtered', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	;

	var past = parseInt(req.body.date, 10) || 7;
	var start = new Date(new Date().getTime() - past*86400*1000);

	req.body.date = {
		$gte: start
	};

	console.log(req.body);

	TelemetryAvg.find(req.body).sort('-date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
				docs[idx].miliseconds = date.getTime();
			});

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
			res.render('telemetry-compare', {
				title : 'telemetry average',
				results: docs
			});

		}

	});

});

app.get('/view/results', function (req, res) {

	var commitSchema = schemes.commitSchema
	,	Commit = db.model('Commit', commitSchema);
	
	Commit.find().sort('-date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
				docs[idx].miliseconds = date.getTime();
			});

			res.render('visualisations', {
				title: 'Visualisation menu',
				tests: docs
			});
		}
	});

});

app.get('/view/:commit', function (req, res) {

	var schema = schemes.test_scheme
	,	Test = db.model('Test', schema);

	Test.find({'commit' : req.params.commit}, function (err, docs) {
		if(err)
			console.log(err);
		else {
			var result = {};
			docs.forEach(function (d) {
				console.log(d.test);
				if(result[d.test]) {
					if(result[d.test][d.browser + ' ' + d.version + ' ' + d.os]) {
						result[d.test][d.browser + ' ' + d.version + ' ' + d.os].result += parseFloat(d.result,10);
						result[d.test][d.browser + ' ' + d.version + ' ' + d.os].count++;
					} else {
						result[d.test][d.browser + ' ' + d.version + ' ' + d.os] = {
							result : parseFloat(d.result, 10),
							count  : 1,
							id     : d._id
						};
					}
				}
				else {
					result[d.test] = {};
					result[d.test][d.browser + ' ' + d.version + ' ' + d.os] = {
						result  : parseFloat(d.result, 10),
						count   : 1,
						id		: d._id
					};
				}
			});
			// console.log(docs);
			console.log(result);
			res.render('commit-view', {
				title: 'Viewing details for commit ' + req.params.commit.substring(0,7),
				commit: req.params.commit,
				result: result,
				results: docs
			});
		}
			
	});
});

app.get('/json/:what/:value', function(req, res){

	var schema = schemes.test_scheme
	,	Test = db.model('Test', schema)
	,	search = {};

	search[req.params.what] = req.params.value;
	Test.find(search)
		.select('test result browser device os commit ua')
		.exec(function(err, docs){
			if(err)
				console.log(err);
			else
				if (!docs.length)
					res.end('Got nothin\'');
				else {
					console.log(docs);
					res.json(docs);
				}
	});

});


var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
