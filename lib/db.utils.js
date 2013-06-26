var dbUtils = (function () {

	var exists = function (model, query, cb) {
		model.findOne(query, function (err, doc) {
			if (err) {
				console.log('Error: ', err);
			} else {
				cb(doc);
			}
		})
	}

	return {
		exists: exists
	}

})();

module.exports = dbUtils;