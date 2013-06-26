
var parser = {
	// parses url get params into arrays
	query : function (query) {
		var result = {};
		query = query.split('&').filter(function (el) {
			if (el.length) return el;
		});

		query.forEach(function (q) {
			var term = q.split('=');
			if (!result[term[0]])
				result[term[0]] = [term[1]];
			else if (!~result[term[0]].indexOf(term[1]))
				result[term[0]].push(term[1]);
		});
		return result;
	},
	// parses url params into a mongo query
	urlQuery : function (body) {
		console.log(body);
		var query = {};
		var skip = ['date', 'platform'];

		var past = parseInt(body.date, 10) || 365;
		var start = new Date(new Date().getTime() - past*86400*1000);

		query.date = {
			$gte : start
		}

		for (var i in body) {

			if (skip.indexOf(i) != -1) continue;

			if (typeof body[i] == 'object') {
				query[i] = {
					$in : body[i]
				}
			} else {
				query[i] = unescape(body[i]);
			}
		}
		console.log('query => ', query);
		return query;
	}
}

module.exports = parser;