 /* Topcoat benchmark server */

var express = require('express')
  , mongoose = require('mongoose')
  , schemes = require('./schemes')
  , path = require('path')
  , uaParser = require('ua-parser')
  , url = require('url');

var app = express();
var db;


if(process.env.PORT) { // switch between local and production env
	db = mongoose.connect('mongodb://ec2-54-245-99-50.us-west-2.compute.amazonaws.com/topcoat');
	console.log('Connected to amazondb');
} else {
	db = mongoose.connect('mongodb://localhost:27017/topcoat');
	console.log('Fallback to localdb');
}

app.configure(function () {
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
		layout : 'landing-layout.jade',
		title : 'Topcoat Server'
	});

});

app.get('/baseline', function(req, res){

	res.render('baseline', {
		layout : 'none',
		title : 'TopCoat Server'
	});

});

app.post('/v2/benchmark', function (req, res) {

	res.header("Access-Control-Allow-Origin", "*");
	req.body = JSON.parse(req.body.data);

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua || req.body.resultName['UserAgent ()'])
	,	sanitize = require('validator').sanitize
	;

	var telemetryTest = new TelemetryTest({
			ua     : req.body.resultName['UserAgent ()']
		,	device : sanitize(req.body.device).xss()
		,	os 	   : ua.os.toString()
		,	browser: ua.family
		,	version: ua.major + "." + ua.minor + "." + ua.patch
		,	commit : sanitize(req.body.commit).xss()
		,	date   : req.body.date
		,	result : {}
		,	test   : sanitize(req.body.test).xss()
	});

	for(var i in req.body.resultName) {
		telemetryTest.result[i] = sanitize(req.body.resultName[i]).xss();
	}

	telemetryTest.save(function (err) {
		if(err) {
			console.log('Error saving result');
		}
	});

	var query = {
		commit   : req.body.commit,
		platform : ua.family + ' ' + ua.major + "." + ua.minor + "." + ua.patch + ' ' + ua.os.toString(),
		test     : req.body.test,
		device   : req.body.device
	};

	if (req.body.date)
		query['date'] = req.body.date;

	TelemetryAvg.findOne(query, function (err, doc) {
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

app.get('/dashboard', function (req, res) {

	var params = req.url.split('&');
	var parser = require('./lib/parser');
	var query = parser.query(url.parse(req.url).query);

	res.render('dashboard', {
		'title'  : 'Topcoat Dashboard',
		'test'   : query.test,
		'device' : query.device
	});

});

app.get('/dashboard/jplot', function (req, res) {

	var params = req.url.split('&');
	var parser = require('./lib/parser');
	var query = parser.query(url.parse(req.url).query);

	res.render('telemetry.jplot.jade', {
		'title'  : 'Topcoat Dashboard',
		'test'   : query.test,
		'device' : query.device
	});

});

	app.post('/dashboard/get', function (req, res) {
		var search = {};
		console.log('/dash/get');

		if (typeof req.body.test == 'object') {
			search.test = {
				$in : req.body.test
			};
		} else {
			search.test = req.body.test;
		}

		search.device = req.body.device;

		var	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg);

		TelemetryAvg.find(search).sort('+date').execFind(function (err, docs) {
			if (err) {
				console.log(err);
				res.json(err);
			} else {
				var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				filter = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)'];
				docs.forEach(function (doc, idx) {
					if (doc.test.match(/base/g)) {
						for (var i in filter) {
							if (doc.result[filter[i]]) {
								console.log(doc.result[filter[i]]);
								doc.result[filter[i] + ' base'] = doc.result[filter[i]];
							}
						}
					}
					var date = new Date(doc.date);
					docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
					docs[idx].formatedDate += " " + date.getHours() + ":" + date.getMinutes();
					docs[idx].miliseconds = date.getTime();
				});
				console.log(docs);
				res.json(docs);
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

	TelemetryAvg.find(date).sort('-test -date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = date.toISOString();
			});

			console.log(docs);
			res.render('telemetry-average', {
				title : 'Average telemetry results',
				results: docs
			});
		}
	});

});

app.get('/view/test/:id', function (req, res) {

	var id = req.params.id;
	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg);

	TelemetryAvg.findOne({_id: id}, function (err, doc) {
		var find = {
			test   : doc.test,
			commit : doc.commit,
			device : doc.device
		};

		if (find.device == 'device?') delete find.device; // don't match the default value

		TelemetryTest.find(find, function (err, docs) {
			res.render('telemetry-individual', {
				title : 'Telemetry individual results',
				results: docs,
				average_id :id
			});
		});

	});

});

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

		app.post('/remove/test', function (req, res) {

			var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
			,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
			,	ua = uaParser.parse(req.body.ua)
			;

			var findAndRemove = []; // i'll add the docs that need removing here
			var docsRemaining = []; // these will make up the average later
			var average_id = req.body.average_id;
			delete req.body.average_id;

			for (var i in req.body) {
				if (docsRemaining.indexOf(req.body[i]) > -1) {
					findAndRemove.push(req.body[i]);
				}
				docsRemaining.push(req.body[i]);
			}

			TelemetryTest.remove({_id : { $in: findAndRemove }}, function () {
				// after i removed them i need to make up the average
				TelemetryTest.find({_id : { $in : docsRemaining }}, function (err, docs) {

					if (err) res.end(err);
					var update = {};

					// sum up all the results
					docs.forEach(function (doc) {
						for(var i in doc.result) {
							if (!update[i]) {
								if(!isNaN(parseFloat(doc.result[i])))
									update[i] = parseFloat(doc.result[i]);
								else
									update[i] = doc.result[i];
							} else
								if(!isNaN(parseFloat(doc.result[i]))) {
									update[i] += parseFloat(doc.result[i]);
								}
						}
					});

					// divide by the number of results;
					var count = docs.length;
					for (var i in update)
						if(!isNaN(parseFloat(update[i])))
							update[i] /= count;
					if (count) // if there is something left updating
						TelemetryAvg.findOne({_id : average_id}, function (err, doc) {
							if (err) res.json(err);
							else {
								doc.result = update;
								doc.count = count;
								doc.save(function () {
									res.end('average saved');
								});
							}
						});
					else
						TelemetryAvg.remove({_id: average_id}, function () {
							res.end('Average removed');
						});
				});
			});
		});

app.post('/v2/view/results/filtered', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	,	query
	;

	var past = parseInt(req.body.date, 10) || 365;
	var start = new Date(new Date().getTime() - past*86400*1000);

	if (typeof req.body.commit === 'object')
		req.body.commit.forEach(function (commit, idx) {
			commit = commit.replace(/%3A/g, ':');
			if (new Date(commit) != 'Invalid Date') {
				query = {
					$or : [
							{ commit : (idx) ? req.body.commit[0] : req.body.commit[1] },
							{ date : commit }
						]
				};

				if (typeof req.body.test === 'object') {
					var tests = req.body.test;
					query.test = {$in:tests};
				}

				query.date = {
					$gte: start
				};

			}
		});

	req.body.date = {
		$gte: start
	};

	if (typeof req.body.commit === 'object') {
		var commits = req.body.commit;
		req.body.commit = {$in:commits};
	} else {
		if (req.body.commit && req.body.commit.match(/%3A/g))
			var commit = req.body.commit.replace(/%3A/g, ':');
		if (new Date(commit) != 'Invalid Date') {
			req.body.date = commit;
			delete req.body.commit;
		}
	}


	if (typeof req.body.test === 'object') {
		var tests = req.body.test;
		req.body.test = {$in:tests};
	}

	console.log(query);
	console.log(req.body);

	TelemetryAvg.find(query || req.body).sort('-test -date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = date.toISOString();
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
			console.log(docs);
			res.render('telemetry-compare', {
				title : 'telemetry average',
				results: docs
			});

		}

	});

});

app.get('/view/results', function (req, res) {

	res.redirect('/v2/view/results');

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
