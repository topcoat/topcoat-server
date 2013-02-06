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
	topcoat_v : { type: Number, default: '0.0'},
	time : {type: Date, default : Date.now() }
});

var Selector = new Schema({
	delta: { type: String, default: 'delta time' },
	selector: { type: String, default: 'selector' },
	total: { type: String, default: 'total time' }
});

var stressCSS = new Schema({
	baselineTime: { type: String, default: 'baseline time' },
	commit: { type: String, default: 'github hash'},
	date: { type: Date },
	os: { type: String, default: 'OS' },
	version: { type: String, default: 'unknown browser version'},
	browser: { type: String, default: 'browser' },
	device: { type: String, default: 'device' },
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