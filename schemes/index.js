var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var test_schema = new Schema({
	result: { type: String, default: 'test result' },
	os: { type: String, default: 'OS' },
	version: { type: String, default: 'unknown browser version'},
	browser: { type: String, default: 'browser' },
	device: { type: String, default: 'device' },
	test: { type: String, default: 'test name' },
	ua: { type: String, default: 'user ua' },
	commit: { type: String, default: 'github hash'},
	date: { type: Date },
	selector: [Selector]
});

var telemetry_test = new Schema({
	
		result   : { type : Object }
	,	ua     : { type : String, default : 'user agent' }
	,	device : { type : String, default : 'device' }
	,	os 	 : { type : String, default : 'OS' }
	,	browser: { type : String, default : 'browser' }
	,	version: { type: String, default: 'unknown browser version'}
	,	commit : { type : String, default : 'github hash'}
	,	date   : { type : Date }
	,	test: { type: String, default: 'test name' }
	,	component: {type: String, default: 'component'}
});

var telemetry_avg = new Schema({

		result   : { type : Object }
	,	commit   : { type : String, default : 'github hash'}
	,	date     : { type : Date }
	,	platform : { type : String, default : 'platform tested'}
	,	test  	 : { type : String, default : 'test name' }
	, 	device	 : { type : String, default : 'device?' }
	,	count	 : { type : Number, default : 1}
	,	ua		 : { type : String, default : 'ua string' }
	,	component: { type : String, default : 'component'}
});

var commitSchema = new Schema({
	commit: { type: String, default: 'github hash'},
	date: { type: Date }
});

var Selector = new Schema({
	delta: { type: String, default: 'delta time' },
	selector: { type: String, default: 'selector' },
	total: { type: String, default: 'total time' }
});

var stressCSS = new Schema({
	result: { type: String, default: 'baseline time' },
	os: { type: String, default: 'OS' },
	version: { type: String, default: 'unknown browser version'},
	browser: { type: String, default: 'browser' },
	device: { type: String, default: 'device' },
	test: { type: String, default: 'test name' },
	commit: { type: String, default: 'github hash'},
	date: { type: Date },
	ua: { type: String, default: 'user ua' },
	selector: [Selector]
});

var view_schema = new Schema({
	test: { type:String, default: 'test name' },
	total: {type: Number, default: 0 },
	description: {type: String, default: 'test description' }
});

module.exports.test_scheme = test_schema;
module.exports.view_schema = view_schema;
module.exports.stressCSS = stressCSS;
module.exports.selector = Selector;
module.exports.commitSchema = commitSchema;
module.exports.telemetry_test = telemetry_test;
module.exports.telemetry_avg = telemetry_avg;