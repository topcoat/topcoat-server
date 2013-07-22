/**
 *
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var tbody = document.querySelector('tbody');
var dates = [7, 14, 30, 365];

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
	xhr.open('POST', '/view/results/filtered', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			cb(this.responseText);
			addEventListeners();
		}
	};
	xhr.send(formData);
};

function updateResults () {
	var formData = new FormData(),
		date = location.href.match(/date\=[0-9]*/i)
	;

	date = (date) ? date[0].split('=')[1] : 0;

	if (date) formData.append('date', date);

	$('#filters li').each(function (idx, li) {
		formData.append($(li).data('filter'), $(li).data('value'));
	});

	submit(formData, function (data) {
		$('tbody').html(data);
	});

	createFilterURL();
}

function removeFilter (e) {
	e.preventDefault();
	this.parentNode.parentNode.removeChild(this.parentNode);
	updateResults();
};

var createFilterURL = function () {
	var stringURL = 'results?';
	$('#filters li').each(function (idx, li) {
		stringURL += $(li).data('filter') + '=' + $(li).data('value') + '&';
	});
	var select = document.querySelector('select');
	stringURL += 'date=' + select.options[select.selectedIndex].dataset.value + '&';

	history.pushState('', '', stringURL);
};

var appendFilter = function (key, value) {

	var $div = $('<div/>');

	var $li = $('<li/>')
		.data('filter', key)
		.data('value', value);

	$('<a/>').text(key + ' ' + value)
		.appendTo($li);

	$('<a/>').addClass('close')
		.html('&times;')
		.on('click', removeFilter)
		.appendTo($li);

	$div.append($li);

	$('#filters').append($div);
};

function appendDate (date) {
	var select = document.querySelector('select'),
		values = ['7', '14', '30', '365']
	;
	select.selectedIndex = values.indexOf(date);
}

function appendFilters (filters) {

	var formData = new FormData();
	var l = filters.length;

	filters.forEach(function (filter) {
		if (filter[0] != 'date')
			appendFilter(filter[0], filter[1]);
		else
			appendDate(filter[1]);

		formData.append(filter[0], filter[1]);

		if (--l == 0) {
			submit(formData, function (data) {
				$('tbody').html(data);
			});
		}
	});
}

// add a new filter to the view
// the function also handles previous filters
var addFilter = function (e) {
	e.preventDefault();

	var $li   = $('<li/>')
	,	$this = $(this)
	;

	$('<a/>').html(this.dataset.filter + ' ' + this.dataset.value)
			.appendTo($li);
	$('<a/>').addClass('close').html('&times;')
			.on('click', removeFilter)
			.appendTo($li);

	$li.data('filter', this.dataset.filter)
		.data('value', this.dataset.value)

	$('#filters').append($li);
	updateResults();
};

document.querySelector('.js-handler--date').addEventListener('change', function (e) {

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
		$('tbody').html(data);
	});

	history.pushState('', '', stringURL);
});

var addEventListeners = function () {
	var filterButton = document.querySelectorAll('.add-filter');
	[].forEach.call(filterButton, function (button) {
		button.addEventListener('click', addFilter, false);
	});
	var plotBtn = document.querySelectorAll('.js-handler--plot');
	[].forEach.call(plotBtn, function (b) {
		b.addEventListener('click', plotHandler, false);
	});
	$('input[name^=average_]').on('change', function () {
		if (!$('input[name^=average_]:checked').length) {
			$('.js-handler--plot').attr('disabled', true);
		} else {
			$('.js-handler--plot').attr('disabled', false);
		}
	})
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

function existy (el) {
	return (el && el !== null) ? true : false;
}

function parseFilter () {
	var filters = location.search.substr(1);
	filters = window.decodeURI(filters);
	filters = filters.split('&');
	filters = filters.filter(existy);
	filters = filters.map(function (el, idx) {
		return el.split('=');
	});
	return filters;
}

(function init () {
	var filters = parseFilter();
	appendFilters(filters);
	addEventListeners();
})();