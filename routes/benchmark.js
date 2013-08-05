var uaParser = require('ua-parser');
var schemes = require('../schemes');
var dbUtils = require('../lib/db.utils');

var benchmark = function (db) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	sanitize = require('validator').sanitize
	,	parser = require('../lib/parser')
	;

	var add = function (req, res) {

			try {
				req.body = JSON.parse(req.body.data);
			} catch (e) {
				console.log('Error parsing JSON: ', req.body);
			}
			var ua = uaParser.parse(req.body.ua || req.body.resultName['UserAgent ()']);

			res.header("Access-Control-Allow-Origin", "*");

			var telemetryTest = new TelemetryTest({
					ua     : req.body.resultName['UserAgent ()']
				,	device : sanitize(req.body.device).xss()
				,	os     : ua.os.toString()
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

			dbUtils.exists(TelemetryAvg, query, function (doc) {
				if (!doc) {
					var telemetryAvg = new TelemetryAvg({
						result   : telemetryTest.result,
						commit   : req.body.commit,
						date     : req.body.date,
						platform : ua.family + ' ' + ua.major + "." + ua.minor + "." + ua.patch + ' ' + ua.os.toString(),
						test     : req.body.test,
						device   : req.body.device,
						count	 : 1,
						ua       : telemetryTest.ua
					});
					telemetryAvg.save(function (err) {
						if(err) {
							console.log('err', err);
						} else {
							res.end('Result saved. New result');
						}
					});
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
					doc.save(function (err) {
						if (err) {
							console.log('Error', err);
						} else {
							res.end('Result saved. Average updated');
						}
					});
				}
			});
	};

	var get = function (req, res) {

			var search = parser.urlQuery(req.body);

			var	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg);
			TelemetryAvg.find(search).sort('+date').execFind(function (err, docs) {
				if (err) {
					console.log(err);
					res.json(err);
				} else {
					if (!docs.length)
						console.log('nothing found');
					res.json(docs);
				}

			});
	};

	var viewResults = function (req, res) {
		var date = {
			date : {
				$gte: new Date(new Date().getTime() - 7*86400*1000).toISOString()
			}
		};

		TelemetryAvg.find(date).sort('-test -date').execFind(function (err, docs) {
			if(err)
				console.log(err);
			else {
				res.render('view-results-new.jade', {
					title : 'Topcoat Server',
					results: docs
				});
			}
		});
	};

	var removeTest = function (req, res) {

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
	};

	return {
		add         : add,
		get         : get,
		viewResults : viewResults,
		removeTest  : removeTest
	}
};

module.exports = benchmark;