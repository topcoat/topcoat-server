var params   = window.location.href.match(/\?.{0,}/g),
	formdata = new FormData(),
	filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)'],
	plotData = {};

params = (params) ? params[0].slice(1).split('&') : null;

var parse = function (data) {
	data = JSON.parse(data);
	var results = data.map(filterResults);
	plot();
};


/*
	filters through the results
	separates the base results from the rest
*/
var filterResults = function (d) {
	filter.forEach(function baseOrStandard (f) {
		if (d.result[f] || d.result[f + ' base']) {
			if (plotData[f]) {
				if (d.test.match(/base/g))
					plotData[f][0] = d.result[f + ' base'];
				else
					plotData[f].push(d.result[f]);
			} else {
				if (d.test.match(/base/g))
					plotData[f] = [d.result[f + ' base']];
				else
					plotData[f] = ['', d.result[f]];
			}
		}
	});
};

/*
	Get the data
*/
var submit = function (formData, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/dashboard/get', true);
	xhr.onload = function xhrLoaded (e) {
		if (this.status == 200) {
			cb(this.response);
		}
	};
	xhr.send(formData);

};

(function plot () {

	var l = params.length;
	params.forEach(function urlParams (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, parse);
		}
	});

})();