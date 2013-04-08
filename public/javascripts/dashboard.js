var params   = window.location.href.match(/\?.{0,}/g)
,	formdata = new FormData()
,	json // json from server
,	commits = [] // commit hash
,	testInfo = document.querySelector('#commit-info')
,	res = {} // y coords
,	filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)']
,	commitCompare = document.querySelector('#compare-commits')
,	strokes = 0;
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

		if (test.commit[0] == 's') test.commit = test.commit.substring(4,31);

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
	;

	w = w || 800;
	h = h || 700;

	json = JSON.parse(data);

	for(var i = 0 ; i < json.length; ++i) {
		if (allcommits.indexOf(json[i].commit) == -1 && allcommits.indexOf(json[i].commit + json[i].date) == -1) {
			if (json[i].commit[0] == 's')
				allcommits.push(json[i].commit + json[i].date);
			else
				allcommits.push(json[i].commit);
		}
	}

	generateXaxis();

	if(!json.length) return;

	json.forEach(function (doc) {

		commits.push(doc.commit);

		filter.forEach(function (field) {
			if (!doc.result) return;
			if (doc.result[field]) {
				res[filter.indexOf(field)].push(parseInt(doc.result[field], 10));
				count[filter.indexOf(field)]++;
			}
		});
	});

	// simulate distance between commits
	for (var i = 0; i < Math.max(res[0].length, res[1].length); ++i) {
		xaxis.push(10*i);
	}

	var lines = r.linechart(50, 20, w, h, [resx[0], resx[1], resx[2]], [res[0], res[1], res[2]], {
		axis: "0 0 1 1", axisxstep : allcommits.length-1, axisystep : 10,symbol: "circle"
	}).hoverColumn(function () {
		this.tags = r.set();

		var markers = [];
		lines.eachColumn(function () {
			this.y.forEach(function (y, idx) {
				if (y)
					markers[idx] = y;
			});
		});

		for (var i = 0, ii = this.y.length; i < ii; i++) {
			if(this.y[i]) {
				this.tags.push(r.tag(this.x, this.y[i], this.values[i] + ' ms', 0, 8).insertBefore(this));
				this.tags.push(r.tag(900, markers[i], ' ' + filter[i] + ' ', 0, 0).insertBefore(this));
				this.tags.animate({opacity:0}, 0);
				this.tags.animate({opacity:1}, 400);
			}
		}
	}, function () {

		this.tags.animate({opacity:0}, 150, function () {
			this.remove();
		});
		// this.tags && this.tags.remove();
	}).clickColumn(function () {

		var coordx = this.x;
		if (strokes==2) strokes = 0;

		for(var i = 0; i < lines.symbols.length; ++i) {
			for (var j = 0 ; j < lines.symbols[i].length; ++j) {
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

		if(!commitCompare.querySelectorAll('input[name=date]').length) {
			inputDate = document.createElement('input');
			inputDate.type = 'hidden';
			inputDate.name = 'date';
			inputDate.value = '30';
			commitCompare.insertBefore(inputDate, deviceNode);
		} else {
			inputDate = commitCompare.querySelector('input[name=date]');
		}

		input.type = 'text';
		input.value = comm;
		if(comm[0] == 's') {
			input.value = comm.substring(8,48);
		}
		console.log(comm);
		input.name = 'commit';

		var selectedCommits = commitCompare.querySelectorAll('input[type=text]').length;

		if (selectedCommits < 2) {
			commitCompare.insertBefore(input, inputDate);
		} else {
			var replacement = commitCompare.querySelector(':first-child');
			replacement.parentNode.removeChild(replacement);

			// commitCompare.innerHTML = '';
			commitCompare.insertBefore(input, inputDate);
		}


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
		if (allcommits[idx][0] == 's') {
			xPoint.attr('text', 'S@' + allcommits[idx].substring(8,18));
			xPoint.attr('fill', '#f44');
			console.log(xPoint);
		}
		else
			xPoint.attr("text", allcommits[idx].substring(0, 7));
	});

};

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