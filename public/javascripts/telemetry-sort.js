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

	var formData = new FormData();
	var filters = document.querySelectorAll('#filters li');

	if (!filters.length)
		window.location.href = window.location.pathname;

	[].forEach.call(filters, function (li, idx) {
		formData.append(li.dataset.filter, li.dataset.value);
	});

	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
		addEventListeners();
	});

	return false;

};

// add a new filter to the view
// the function also handles previous filters
var addFilter = function () {

	var li       = document.createElement('li')
	,	a        = document.createElement('a')
	,	close    = document.createElement('a')
	,	formData = new FormData()
	;

	formData.append(this.dataset.filter, this.dataset.value);

	[].forEach.call(document.querySelectorAll('#filters li'), function (li, idx) {
		formData.append(li.dataset.filter, li.dataset.value);
	});

	a.innerHTML = this.dataset.filter+' '+this.dataset.value;
	close.classList.add('close');
	close.innerHTML = '×';

	li.appendChild(a);
	li.appendChild(close);

	li.dataset.filter = this.dataset.filter;
	li.dataset.value  = this.dataset.value;

	close.addEventListener('click', removeFilter, false);

	document.querySelector('#filters').appendChild(li);

	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
		addEventListeners();
	});

};

document.querySelector('select').addEventListener('change', function (e) {

	var formData = new FormData();

	formData.append('date', this.options[this.selectedIndex].dataset.value);

	submit(formData, function (data) {
		document.querySelector('tbody').innerHTML = data;
		addEventListeners();
	});

});

var addEventListeners = function () {
	var filterButton = document.querySelectorAll('.add-filter');
	[].forEach.call(filterButton, function (button) {
		button.addEventListener('click', addFilter, false);
	});
};

addEventListeners();