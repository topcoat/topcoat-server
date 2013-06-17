var result = {};

var parser = {
	query : function (query) {
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
	}
}

module.exports = parser;