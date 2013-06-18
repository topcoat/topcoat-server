var params   = window.location.href.match(/\?.{0,}/g)
,	formdata = new FormData()
,	json // json from server
,	commits = [] // commit hash
,	testInfo = document.querySelector('#commit-info')
,	res = {} // y coords
,	filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)']
,	commitCompare = document.querySelector('#compare-commits')
,	strokes = 0
;

params = (params) ? params[0].slice(1).split('&') : null;

// 3 arrays for 3 different tests
// x axis is always the same
res[0] = [];
res[1] = [];
res[2] = [];

resx = {};
resx[0] = [];
resx[1] = [];
resx[2] = [];

axisx = {};

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

var get = function (url, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			cb(this.response);
		}
	};
	xhr.send();
};

var updateInfo = function (tests) {

	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	testInfo.innerHTML = '';
	var docFrag = document.createDocumentFragment();

	tests.forEach(function (test) {

		var date = new Date(test.date)
		,	h2 = document.createElement('h2')
		,	a = document.createElement('a')
		,	a2 = document.createElement('a')
		,	li = document.createElement('li')
		,	li2 = document.createElement('li')
		,	li3 = document.createElement('li')
		,	li4 = document.createElement('li')
		,	device = location.href.match(/device=.{1,}/)[0]
		;

		if (test.commit[0] != 's') {
			a.innerHTML = 'Commit #' + test.commit.substring(0, 7);
			a.href = 'https://github.com/topcoat/topcoat/commit/' + test.commit;
			a.target = '_blank';
			h2.appendChild(a);
		} else {
			h2.innerHTML = 'snapshot ' + test.date;
		}

		if (test.commit[0] == 's') test.commit = 'snapshot';

		a2.href = '/v2/view/results?commit='+test.commit+'&date=30&' + device;
		a2.target = '_blank';
		a2.innerHTML = 'View test results for commit';
		li4.appendChild(a2);

		li.innerHTML = 'Date : ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
		li2.innerHTML = 'Test name : ' + test.test;
		li3.innerHTML = 'Runs : ' + test.count;

		docFrag.appendChild(h2);
		docFrag.appendChild(li);
		docFrag.appendChild(li2);
		docFrag.appendChild(li3);
		docFrag.appendChild(li4);

	});

	testInfo.appendChild(docFrag);


};

var count = [0,0,0];

// generateXaxis populates resx with x-axis coordinate for 
// each of the 3 lines on the graph
// since the commits are ordered by date in allcommits
// i just multiple the indexOf the commit by 10
var generateXaxis = function () {
	filter.forEach(function(f, idx){
		json.forEach(function (t) {
			if (!t.result) return; // :( should never happen
			if (t.result[f]) {
				var commit = t.commit;
				if (commit == 'snapshot')
					commit += t.date;
				resx[idx].push(allcommits.indexOf(commit) * 10);
			}
		});

	});

};

var allcommits = [];

var plot = function (data, w,h) {

	var r = Raphael("holder")
	,	xaxis = []
	,	commitPos = []
	,	maxValue = 0;
	;

	w = w || 1000;
	h = h || 1000;

	json = JSON.parse(data);
	if (!json.length) return;

	for(var i = 0 ; i < json.length; ++i) {
		if (allcommits.indexOf(json[i].commit) == -1 && allcommits.indexOf(json[i].commit + json[i].date) == -1) {
			if (json[i].commit[0] == 's')
				allcommits.push(json[i].commit + json[i].date);
			else
				allcommits.push(json[i].commit);
		}
	}

	generateXaxis();

	json.forEach(function (doc) {

		commits.push(doc.commit);

		filter.forEach(function (field) {
			if (!doc.result) return;
			if (doc.result[field]) {
				var value = parseInt(doc.result[field], 10);
				res[filter.indexOf(field)].push(value);
				if (value > maxValue) {
					maxValue += 1000;
				}
				count[filter.indexOf(field)]++;
			}
		});
	});

	// simulate distance between commits
	for (var i = 0; i < Math.max(res[0].length, res[1].length); ++i) {
		xaxis.push(10*i);
	}

	var steps = allcommits.length-1 || 1;
	var lines = r.linechart(50, 20, w, h, [resx[0], resx[1], resx[2], [0, 0]], [res[0], res[1], res[2], [maxValue, 0]], {
		axis: "0 0 1 1", axisxstep : steps, axisystep : 10,symbol: "circle", colors: ['#2f6abd', '#bd572f', '#a0bd2f', 'transparent']
	}, 0, 0,0,0).hoverColumn(function (e) {

		var xoffset = this.x;
		var comm = allcommits[this.axis/10];
		var tests;
		json.forEach(function (t) {
			if (t.commit == comm || t.commit + t.date == comm) {
				tests = {
					test   : t.test,
					commit : t.commit,
					date : (new Date(t.date)).toString()
				}
				for(var i in t.result) {
					if (~filter.indexOf(i)) {
						tests[i] = t.result[i];
					}
				}
			}
		});

		// the tooltip below the x axis
		tooltip(xoffset, tests);

		this.tags = r.set();

		var markers = [];

		for (var i = 0, ii = this.y.length; i < ii; i++) {
			if (this.values[i] == maxValue || this.values[i] == 0) continue; // skip the dummy value
			this.tags.push(r.tag(this.x, this.y[i], this.values[i] + ' ms', 0, 8).insertBefore(this));
			this.tags.animate({opacity:0}, 0);
			this.tags.animate({opacity:1}, 400);
		}
	}, function () {

		this.tags.animate({opacity:0}, 150, function () {
			this.remove();
		});

	}).clickColumn(function () {

		var coordx = this.x;
		if (strokes==2) strokes = 0;

		for(var i = 0; i < lines.symbols.length; ++i) {
			for (var j = 0; j < lines.symbols[i].length; ++j) {
				if (lines.symbols[i][j].attrs.fill == 'transparent') continue; // dummy elements
				if (strokes === 0) {
					lines.symbols[i][j].attr({'stroke-width':0});
				}
				if ( lines.symbols[i][j].attrs.cx == coordx ) {
					lines.symbols[i][j].attr({'stroke-width':3, 'stroke':'#ff0000'});
				}
			}
		}
		strokes++;

		var comm 		= allcommits[this.axis/10]
		,	tests 		= []
		,	input 		= document.createElement('input')
		,	inputDate
		,	deviceNode 	= document.querySelector('input[type=submit]')
		;

		json.forEach(function (t) {
			if (t.commit == comm || t.commit + t.date == comm) {
				tests.push({
					commit : comm,
					test   : t.test,
					count  : t.count,
					date   : t.date
				});
			}
		});

		updateInfo(tests);

	});

	// change x axis labels to commit hash
	lines.axis[0].text.items.forEach(function (xPoint, idx) {
		commitPos.push(xPoint.attrs.x);

		axisx[xPoint.attr('text')] = allcommits[idx];
		if (allcommits[idx]) {
			if (allcommits[idx][0] == 's') {
				xPoint.attr('text', 'S@' + allcommits[idx].substring(8,24));
				xPoint.attr('fill', '#f44');
			}
			else
				xPoint.attr("text", allcommits[idx].substring(0, 7));
		}
	});

};

function getCommitMsg(commit) {
	var url = 'https://api.github.com/repos/topcoat/topcoat/git/commits/' + commit;
	get(url, function (data) {
		var json = JSON.parse(data);
		console.log(json);
		var url = 'https://api.github.com/users/' + json.committer.name;
		get(url, function (data) {
			var userInfo = JSON.parse(data);
			displayCommitInfo(json, userInfo.avatar_url);
		});
	});
}

function displayCommitInfo(json, avatar) {
	var docFrag = document.createDocumentFragment();
	var p = document.createElement('p');
	var a = document.createElement('a');
	var img = document.createElement('img');
	var h2 = document.createElement('h2');

	h2.innerHTML = 'Commit info';

	p.innerHTML = json.message;
	a.innerHTML = json.committer.name;
	a.href = 'http://github.com/' + json.committer.name;

	img.src = avatar;

	a.appendChild(img);

	docFrag.appendChild(h2);
	docFrag.appendChild(p);
	docFrag.appendChild(a);

	testInfo.appendChild(docFrag);

}

function tooltip (xoffset, tests) {
	console.log(tests);
	var t = document.querySelector('.tooltip');
	t.innerHTML = '';
	var fragment = document.createDocumentFragment();
	for (var i in tests) {
		var p = document.createElement('p');
		if (i == 'commit') {
			p.innerHTML = i + ': ';
			var a = document.createElement('a');
			a.innerHTML = tests[i];
			a.href = 'https://github.com/topcoat/topcoat/commit/' + tests[i];
			p.appendChild(a);
		} else
			p.innerHTML = i + ': ' + tests[i];
			fragment.appendChild(p);
	}
	t.appendChild(fragment);
	t.style.left = xoffset + 'px';
}

//fetch url params and get data
function getParamsAndPlot () {

	var l = params.length;
	params.forEach(function (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, plot);
		}
	});
}