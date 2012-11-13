var mongoose = require('mongoose');

var schema = mongoose.Schema({
	result: 'string',
	os: 'string',
	version: 'string',
	browser: 'string',
	device: 'string',
	test: 'string'
});

module.exports.test_scheme = schema; 