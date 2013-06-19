var dashboard = document.querySelector('#dashboard-link');
var testNav = document.querySelector('.test-navigation');
var lis = document.querySelectorAll('#components li');
var spinner = document.querySelector('.spinner');
var t;
var filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)'];
var plotData = {
	'mean_frame_time (ms)' : [],
	'load_time (ms)' : [],
	'Layout (ms)' : []
};
var toolTipInfo = {
	'mean_frame_time (ms)' : [],
	'load_time (ms)' : [],
	'Layout (ms)' : []
};
var count = {
	'mean_frame_time (ms)' : 0,
	'load_time (ms)' : 0,
	'Layout (ms)' : 0
};
[].forEach.call(lis, function (li) {

	li.addEventListener('click', function () {

		var activeComponent = document.querySelector('li.active');

		if(activeComponent)
			activeComponent.classList.remove('active');

		var activeCategory = document.querySelector('ul.active');
		if(activeCategory)
			activeCategory.classList.remove('active');

		this.classList.add('active');
		var category = document.querySelector('.' + this.id);
		category.classList.add('active');

		displayPlot.call(document.querySelector('.' + this.id + ' a'));

	});

});

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

var parse = function (data) {
	data = JSON.parse(data);
	plotData = {
	'mean_frame_time (ms)' : [],
	'load_time (ms)' : [],
	'Layout (ms)' : []
	};
	toolTipInfo = {
		'mean_frame_time (ms)' : [],
		'load_time (ms)' : [],
		'Layout (ms)' : []
	};
	count = {
		'mean_frame_time (ms)' : 0,
		'load_time (ms)' : 0,
		'Layout (ms)' : 0
	};
	data.forEach(filterResults);
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


function displayPlot () {

	document.querySelector('.plot li').innerHTML = document.querySelector('li.active').innerHTML + ' plot';

	spinner.style.display = 'block';
	var params   = this.href.match(/\?.{0,}/g)[0].slice(1).split('&');
	var l = params.length;
	var formdata = new FormData();

	console.log(params);
	params.forEach(function (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, function (data) {
				spinner.style.display = 'none';
				parse(data);
			});
		}
	});

}