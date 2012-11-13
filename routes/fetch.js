var fs = require('fs');
var rs = fs.createReadStream;
var path = require('path')

exports.file = function(req, res){
	var file = path.join(__dirname, '..', 'public/tests/', req.params.file);
	fs.exists(file, function(exists){
		exists ? rs(file).pipe(res) : res.end('Boo! No such file :(');
	});
};