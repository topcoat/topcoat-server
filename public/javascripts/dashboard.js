var params   = window.location.search.replace( "?", "" ).split('&')
,	formdata = new FormData()
,	filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout_max (ms)']
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

var plot = function (data) {
	var json = JSON.parse(data);
	json.forEach(function (doc) {
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
	console.log(res[0],res[1],res[2]);

	var lines = r.linechart(50, 10, 800, 300, xaxis, [res[0], res[1], res[2]], {
		axis: "0 0 1 1", axisxstep : 10, axisystep : 10,symbol: "circle"
	}).hoverColumn(function () {
		this.tags = r.set();

		for (var i = 0, ii = this.y.length; i < ii; i++) {
			if(this.y[i])
				this.tags.push(r.tag(this.x, this.y[i], this.values[i], 160, 10).insertBefore(this));
		}
	}, function () {
		this.tags && this.tags.remove();
	});

	  lines.symbols.attr({ r: 6 });
	
};

var l = params.length;
params.forEach(function (p) {
	p = p.split('=');
	formdata.append(p[0],p[1]);
	if(--l === 0) {
		submit(formdata, plot);
	}
});

