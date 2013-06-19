var params   = window.location.href.match(/\?.{0,}/g),
	formdata = new FormData(),
	plotData = {
		'mean_frame_time (ms)' : [],
		'load_time (ms)' : [],
		'Layout (ms)' : []
	};
	toolTipInfo = {
		'mean_frame_time (ms)' : [],
		'load_time (ms)' : [],
		'Layout (ms)' : []
	}
	count = {
		'mean_frame_time (ms)' : 0,
		'load_time (ms)' : 0,
		'Layout (ms)' : 0
	};

params = (params) ? params[0].slice(1).split('&') : null;

var parse = function (data) {
	data = JSON.parse(data);
	data.forEach(filterResults);
	placeCheckboxes();
	plot();
};


/*
	filters through the results
	separates the base results from the rest
*/
var filterResults = function (d) {
	for (var row in d.result) {
		if (plotData.hasOwnProperty(row)) {
			toolTipInfo[row].push({
				date: d.date,
				commit: d.commit
			});
			plotData[row].push([count[row]++, parseFloat(d.result[row])]);
		}
	}
};

/*
	Get the data
*/
var submit = function (formData, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/dashboard/get', true);
	xhr.onload = function xhrLoaded (e) {
		if (this.status == 200) {
			console.log(this.response);
			cb(this.response);
		}
	};
	xhr.send(formData);

};

(function getUrlParams () {

	var l = params.length;
	params.forEach(function urlParams (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, parse);
		}
	});

})();