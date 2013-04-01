var tbody = document.querySelector('tbody');

var submit = function (formData, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/v2/view/results/filtered', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			cb(this.response);
		}
	};
	xhr.send(formData);
};

var removeFilter = function (e) {

	e.preventDefault();

	this.parentNode.parentNode.removeChild(this.parentNode);

	var formData = new FormData()
	,	filters = document.querySelectorAll('#filters li')
	,	date = location.href.match(/date\=[0-9]*/i)
	;


	date = (date) ? date[0].split('=')[1] : 0;

	if (date) formData.append('date', date);

	[].forEach.call(filters, function (li, idx) {
		formData.append(li.dataset.filter, li.dataset.value);
	});

	console.log('remove filter submit');
	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
		addEventListeners();
	});

	createFilterURL();
	return false;

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

window.addEventListener('popstate', function () {
	// x.match(/commit\=([0-9]|[a-f]){40}/g)
	console.log('triggered');
	var filters = location.href.split('?');
	if(filters.length > 1)
		refreshFilters(filters[1].replace('#', ''));

}, false);

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
					var d = parseInt(f[1]);
					var i = 1;
					(d == 7) ? i = 0 : (d == 14) ? i = 1 : i = 2;
					select.selectedIndex = i;
					formData.append('date', select.options[select.selectedIndex].dataset.value);
				}

		}

		});

		document.querySelector('#filters').innerHTML = '';
		document.querySelector('#filters').appendChild(docFrag);
		console.log('refresh filter submit');
		submit(formData, function (data) {
			// console.log(data);
			tbody.innerHTML = data;
			formatDate();
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

	e.preventDefault();

	var li       = document.createElement('li')
	,	a        = document.createElement('a')
	,	close    = document.createElement('a')
	,	formData = new FormData()
	;

	var date = location.href.match(/date\=[0-9]*/i)
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
		addEventListeners();
	});

	createFilterURL();

};

document.querySelector('select').addEventListener('change', function (e) {
	var stringURL = 'results?';
	var formData = new FormData();

	formData.append('date', this.options[this.selectedIndex].dataset.value);

	console.log('select change submit');
	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
		addEventListeners();
	});

	[].forEach.call(document.querySelectorAll('#filters li'), function (li, idx) {
		stringURL += li.dataset.filter + '=' + li.dataset.value + '&';
	});
	stringURL += 'date=' + this.options[this.selectedIndex].dataset.value + '&';
	history.pushState('', '', stringURL);

});

var addEventListeners = function () {
	var filterButton = document.querySelectorAll('.add-filter');
	[].forEach.call(filterButton, function (button) {
		button.addEventListener('click', addFilter, false);
	});
	formatDate();
};

function formatDate () {
	console.log('format');
	[].forEach.call(document.querySelectorAll('.date'), function (el) {
		console.log(el);
		el.innerHTML = moment(el.innerHTML).format("MMMM Do YYYY, h:mm");
	});
}


addEventListeners();