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

	this.parentNode.removeChild(this);

	var formData = new FormData();
	var filters = document.querySelectorAll('#filters li');

	if(!filters.length)
		window.location.href = window.location.pathname;

	[].forEach.call(filters, function (li, idx) {
		var content = li.textContent || li.innerText;
		var arr = content.split(' ');
		var filter = arr[0];
		arr.shift();
		formData.append(filter, arr.join(' '));
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

	var formData = new FormData();

	formData.append(this.dataset.filter, this.dataset.value);

	[].forEach.call(document.querySelectorAll('#filters li'), function (li, idx) {
		var content = li.textContent || li.innerText;
		if(content) {
			var arr = content.split(' ');
			var filter = arr[0];
			arr.shift();
			formData.append(filter, arr.join(' '));
		}
	});


	var li = document.createElement('li');
	var a = document.createElement('a');
	a.innerHTML = this.dataset.filter+' '+this.dataset.value;
	li.appendChild(a);
	li.addEventListener('click', removeFilter, false);
	document.querySelector('#filters').appendChild(li);

	submit(formData, function (data) {
		console.log(data);
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