var params   = window.location.search.replace( "?", "" ).split('&')
,	formdata = new FormData()
,	filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout_max (ms)']
,	json
;

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

var res = {};
res[0] = [];
res[1] = [];
res[2] = [];
var xaxis = [];
var commits = [];
var commitPos = [];
var testInfo = document.querySelector('.test-info');

var updateInfo = function (idx) {

	var h2 = document.createElement('h2');
	var p = document.createElement('li');
	var p2 = document.createElement('li');

	h2.innerHTML = 'Commit #' + commits[idx];
	p.innerHTML = 'Date : ' + Date(json[idx].date);
	p2.innerHTML = 'Platform ' + json[idx].platform;

	testInfo.innerHTML = '';
	testInfo.appendChild(h2);
	testInfo.appendChild(p);
	testInfo.appendChild(p2);

};

var plot = function (data) {
	json = JSON.parse(data);

	json.forEach(function (doc) {

		commits.push(doc.commit.substring(0, 7));

		filter.forEach(function (field) {
			if (doc.result[field]) {
				res[filter.indexOf(field)].push(parseInt(doc.result[field], 10));
			}
		});
	});

	for (var i = 0; i < Math.max(res[0].length, res[1].length); ++i) {
		xaxis.push(10*i);
	}

	var r = Raphael("holder");

	var lines = r.linechart(50, 10, 800, 700, xaxis, [res[0], res[1], res[2]], {
		axis: "0 0 1 1", axisxstep : xaxis.length-1, axisystep : 10,symbol: "circle", axisxlabels : [1]
	}).hoverColumn(function () {
		this.tags = r.set();

		var markers = [];
		lines.eachColumn(function () {
			this.y.forEach(function (y, idx) {
				if (y)
					markers[idx] = y;
			});
		});

		updateInfo(commitPos.indexOf(this.x));

		for (var i = 0, ii = this.y.length; i < ii; i++) {
			if(this.y[i]) {
				this.tags.push(r.tag(this.x, this.y[i], this.values[i] + ' ms', 180, 8).insertBefore(this));
				this.tags.push(r.tag(900, markers[i], ' ' + filter[i] + ' ', 0, 0).insertBefore(this));
			}
		}
	}, function () {
		this.tags && this.tags.remove();
	});
	
	lines.axis[0].text.items.forEach(function (xPoint, idx) {
		commitPos.push(xPoint.attrs.x);
		xPoint.attr("text", commits[idx]);
	});

};

var l = params.length;
params.forEach(function (p) {
	p = p.split('=');
	formdata.append(p[0],p[1]);
	if(--l === 0) {
		submit(formdata, plot);
	}
});

