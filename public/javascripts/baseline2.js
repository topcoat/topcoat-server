var params   = window.location.href.match(/\?.{0,}/g)
,	formdata = new FormData()
,	filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)']
;

var plotData = {};

params = (params) ? params[0].slice(1).split('&') : null;

var parse = function (data) {
	data = JSON.parse(data);
	var results = data.map(function (d) {
		var o = {};
		filter.forEach(function (f) {
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
	});
	plot();
};

var getParamsAndPlot = function () {

	var l = params.length;
	params.forEach(function (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, parse);
		}
	});
};

var submit = function (formData, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/dashboard/get', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			cb(this.response);
		}
	};
	xhr.send(formData);
};

getParamsAndPlot();