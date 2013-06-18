var tbody = document.querySelector('tbody');
var dates = [7, 14, 30, 365];

var buildBreadcrumbs = function (filter) {
	var breadcrumb = document.querySelector('.breadcrumbs')

	if(QueryString.test) {

		var li = document.createElement('li');
		var a = document.createElement('a');

		if (QueryString.test.forEach) {

			a.href = '/dashboard?test=' + QueryString.test[0] + '&test=' + QueryString.test[1];

		} else {
			a.href = '/dashboard?test=' + QueryString.test;
		}

		a.href += '&device=' + QueryString.device;
		a.innerHTML = 'Dashboard';
		li.appendChild(a);

		breadcrumb.appendChild(li);
	}

	var li = document.createElement('li');
	var a = document.createElement('a');

	a.href = '#';
	a.innerHTML = document.title;
	li.appendChild(a);

	breadcrumb.appendChild(li);

};

var plotHandler = function (e) {

	e.preventDefault();
	e.stopPropagation();

	var checked = document.querySelectorAll('td input[type=checkbox]:checked')
	,	plotUrl = '/dashboard?';

	[].forEach.call(checked, function (el) {
		plotUrl += '&test=' + el.dataset.test;
		if (!~plotUrl.search('device=' + el.dataset.device))
			plotUrl += '&device=' + el.dataset.device;
	});

	location.href = plotUrl;
}

var submit = function (formData, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/v2/view/results/filtered', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			cb(this.responseText);
			addEventListeners();
			var plotBtn = document.querySelectorAll('.js-handler--plot');
			[].forEach.call(plotBtn, function (b) {
				b.addEventListener('click', plotHandler, false);
			});
		}
	};
	xhr.send(formData);
};

var removeFilter = function (e) {

	e.preventDefault();

	this.parentNode.parentNode.removeChild(this.parentNode);

	var formData = new FormData(),
		filters = document.querySelectorAll('#filters li'),
		date = location.href.match(/date\=[0-9]*/i)
	;

	date = (date) ? date[0].split('=')[1] : 0;

	if (date) formData.append('date', date);

	[].forEach.call(filters, function (li, idx) {
		formData.append(li.dataset.filter, li.dataset.value);
	});

	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
	});

	createFilterURL();
};

var createFilterURL = function () {
	var stringURL = 'results?';
	[].forEach.call(document.querySelectorAll('#filters li'), function (li, idx) {
		stringURL += li.dataset.filter + '=' + li.dataset.value + '&';
	});
	var select = document.querySelector('select');
	stringURL += 'date=' + select.options[select.selectedIndex].dataset.value + '&';

	history.pushState('', '', stringURL);

};

var refreshFilters = function (filters) {

	if(filters) {

		filters = filters.trim().replace('#', '').replace(/%20/g, " ");
		var docFrag = document.createDocumentFragment()
		,	formData = new FormData()
		;

		var select = document.querySelector('select');

		filters.split('&').forEach(function (filter) {

			if (filter.length) {
				console.log('handling filter ' + filter);
				var li       = document.createElement('li')
				,	a        = document.createElement('a')
				,	close    = document.createElement('a')
				;

				var f = filter.split('=');
				if(f[0] != 'date') {

					a.innerHTML = f[0]+' '+f[1];
					close.classList.add('close');
					close.innerHTML = '×';

					li.appendChild(a);
					li.appendChild(close);

					li.dataset.filter = f[0];
					li.dataset.value  = f[1];
					formData.append(f[0], f[1]);

					close.addEventListener('click', removeFilter, false);
					docFrag.appendChild(li);
				} else {
					var values = ['7', '14', '30', '365'];
					select.selectedIndex = values.indexOf(f[1]);
					formData.append('date', select.options[select.selectedIndex].dataset.value);
				}

		}

		});

		document.querySelector('#filters').innerHTML = '';
		document.querySelector('#filters').appendChild(docFrag);
		console.log(docFrag);
		submit(formData, function (data) {
			tbody.innerHTML = data;
		});

	} else {
		document.querySelector('#filters').innerHTML = '';
	}

};

document.querySelector('#selectall').addEventListener('change', function () {

	[].forEach.call(document.querySelectorAll('input[name*=average]'), function (input) {
		(input.checked) ? input.checked = false : input.checked = true;
	});

}, false);

// add a new filter to the view
// the function also handles previous filters
var addFilter = function (e) {
	console.log('added filter');
	e.preventDefault();

	var li       = document.createElement('li')
	,	a        = document.createElement('a')
	,	close    = document.createElement('a')
	,	formData = new FormData()
	;

	var date = location.href.match(/date\=[0-9]*/i);
	date = (date) ? date[0].split('=')[1] : 0;

	formData.append(this.dataset.filter, this.dataset.value);

	[].forEach.call(document.querySelectorAll('#filters li'), function (li, idx) {
		formData.append(li.dataset.filter, li.dataset.value);
	});

	if (date)
		formData.append('date', date);

	a.innerHTML = this.dataset.filter+' '+this.dataset.value;
	close.classList.add('close');
	close.innerHTML = '×';

	li.appendChild(a);
	li.appendChild(close);

	li.dataset.filter = this.dataset.filter;
	li.dataset.value  = this.dataset.value;

	close.addEventListener('click', removeFilter, false);

	document.querySelector('#filters').appendChild(li);

	console.log('add filter submit');
	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
	});

	createFilterURL();
};

document.querySelector('select').addEventListener('change', function (e) {

	var date = location.href.match(/date=[0-9]{1,3}/);
	var stringURL = '';

	if (date) {
		date = date[0];
		var newDate = date.split('=');
		newDate[1] = this.options[this.selectedIndex].dataset.value;
		newDate = newDate.join('=');
		stringURL = location.href.replace(date, newDate);
	} else {
		stringURL = insertParam('date', this.options[this.selectedIndex].dataset.value);
	}

	var formData = new FormData();
	[].forEach.call(document.querySelectorAll('#filters li'), function (li, idx) {
		formData.append(li.dataset.filter, li.dataset.value);
	});
	formData.append('date', this.options[this.selectedIndex].dataset.value);

	submit(formData, function (data) {
		console.log(data);
		document.querySelector('tbody').innerHTML = data;
	});

	history.pushState('', '', stringURL);
});

var addEventListeners = function () {
	var filterButton = document.querySelectorAll('.add-filter');
	[].forEach.call(filterButton, function (button) {
		button.addEventListener('click', addFilter, false);
	});
};

function insertParam(key, value) {
	var params = document.location.search.substr(1).split('&')
	,	i=params.length
	,	x
	;

	while(i--) {
		x = params[i].split('=');

		if (x[0]==key) {
			x[1] = value;
			params[i] = x.join('=');
			break;
		}
	}

	if(i<0) params[params.length] = [key,value].join('=');

	return location.pathname + '?' + params.join('&');
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
	var pair = vars[i].split("=");
	if (typeof query_string[pair[0]] === "undefined") {
	  query_string[pair[0]] = pair[1];
	} else if (typeof query_string[pair[0]] === "string") {
	  var arr = [ query_string[pair[0]], pair[1] ];
	  query_string[pair[0]] = arr;
	} else {
	  query_string[pair[0]].push(pair[1]);
	}
  }
	return query_string;
} ();

(function init () {
	var filters = location.href.split('?');
	if(filters.length > 1)
		refreshFilters(filters[1].replace('#', ''));
	buildBreadcrumbs();
	addEventListeners();
})();
