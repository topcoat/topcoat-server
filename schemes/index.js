var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var test_schema = new Schema({
	result: { type: String, default: 'test result' },
	os: { type: String, default: 'OS' },
	version: { type: String, default: 'unknown browser version'},
	browser: { type: String, default: 'browser' },
	device: { type: String, default: 'device' },
	test: { type: String, default: 'test name' },
	ua: { type: String, default: 'user ua' }
});

var view_schema = new Schema({
	test: { type:String, default: 'test name' },
	total: {type: Number, default: 0 },
	description: {type: String, default: 'test description' }
});

module.exports.test_scheme = test_schema;
module.exports.view_schema = view_schema;