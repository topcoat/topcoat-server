 /* Topcoat benchmark server */

var express = require('express')
  , mongoose = require('mongoose')
  , schemes = require('./schemes')
  , path = require('path')
  , uaParser = require('ua-parser');

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

app.get('/dashboard', function (req, res) {

	var params = req.url.split('&');

	if(params[1])
		res.render('dashboard', {
			'title'  : 'Topcoat Dashboard',
			'test'   : params[0].substring(16, params[0].length).split(','), //fix me
			'device' : params[1].substring(7, params[1].length),
			navigation : [{title: 'Benchmark', href: '#'}]
		});

	res.render('dashboard', {
			'title'  : 'Topcoat Dashboard',
			'test'   : params[0].substring(16, params[0].length).split(','),
			'device' : 'none',
			navigation : [{title: 'Benchmark', href: '#'}]
		});

});

	app.get('/devices', function (req, res) {

		var	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg);

		console.log(req.url.split('&'));

		TelemetryAvg.find().select('device').sort('-date').execFind(function (err, docs) {
			if(err) {
				console.log(err);
			} else {
				docs.forEach(function (d, idx) {
					var dev = d.device.replace("\"", "");
					dev = dev.replace("\"", "");
					docs[idx].device = dev;
					docs[idx].save();
				});
			}
		});

	});

	app.post('/dashboard/get', function (req, res) {

		var search = {
			test : {
				$in : req.body.test.split(',')
			},
			date : {
				$gte: new Date(new Date().getTime() - 30*86400*1000).toISOString()
			},
			device : req.body.device
		};

		var	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg);

		TelemetryAvg.find(search).sort('+date').execFind(function (err, docs) {
			// console.log(docs);
			if (err) {
				console.log(err);
				res.json(err);
			} else {
				var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				docs.forEach(function (doc, idx) {
					var date = new Date(doc.date);
					docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
					docs[idx].formatedDate += " " + date.getHours() + ":" + date.getMinutes();
					docs[idx].miliseconds = date.getTime();
				});
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
				docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
				docs[idx].formatedDate += " " + date.getHours() + ":" + date.getMinutes();
				docs[idx].miliseconds = date.getTime();
			});
			console.log(docs);
			res.render('telemetry-average', {
				navigation : [{title: 'View averages', href: '#'}],
				title : 'telemetry average',
				results: docs
			});
		}
	});

});

app.get('/view/test/:id', function (req, res) {

	var id = req.params.id;
	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg);

	TelemetryAvg.findOne({'_id' : id}, function (err, doc) {

		var find = {
			test   : doc.test,
			commit : doc.commit,
			device : doc.device
		};

		console.log(find);
		TelemetryTest.find(find, function (err, docs) {

			res.render('telemetry-individual', {
				navigation : [{title: 'View individual results', href: '#'}],
				title : 'telemetry average',
				results: docs
			});

		});

	});




});

app.get('/remove', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	;

	var date = {
		date : {
			$gte: new Date(new Date().getTime() - 30*86400*1000).toISOString()
		}
	};

	TelemetryAvg.find(date).sort('-test -date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
				docs[idx].formatedDate += " " + date.getHours() + ":" + date.getMinutes();
				docs[idx].miliseconds = date.getTime();
			});
			console.log(docs);
			res.render('telemetry-remove', {
				title : 'telemetry average',
				results: docs
			});
		}
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


app.post('/v2/view/results/filtered', function (req, res) {

	var	TelemetryTest = db.model('TelemetryTest', schemes.telemetry_test)
	,	TelemetryAvg  = db.model('TelemetryAvg', schemes.telemetry_avg)
	,	ua = uaParser.parse(req.body.ua)
	;

	var past = parseInt(req.body.date, 10) || 7;
	var start = new Date(new Date().getTime() - past*86400*1000);


	if (typeof req.body.commit === 'object') {
		var commits = req.body.commit;
		req.body.commit = {$in:[commits[0],commits[1]]};
	}

	req.body.date = {
		$gte: start
	};


	console.log(req.body);

	TelemetryAvg.find(req.body).sort('-test -date').execFind(function (err, docs) {
		if(err)
			console.log(err);
		else {
			var months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			docs.forEach(function (doc, idx) {
				var date = new Date(doc.date);
				docs[idx].formatedDate = months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
				docs[idx].miliseconds = date.getTime();
			});
			// console.log(docs);
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