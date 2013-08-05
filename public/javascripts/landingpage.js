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

_.map(document.querySelectorAll('#components li'), function (li) {

	li.addEventListener('click', function () {

		_.map(document.querySelectorAll('.active'), function (v,k) {
			v.classList.remove('active');
			v.classList.add('not-active');
		});

		var className = '.' + this.id;
		document.querySelector(className).classList.remove('not-active');
		document.querySelector(className).classList.add('active');

		displayPlot.call(document.querySelector('.' + this.id + ' a'));
		var flip = document.querySelector('.flip-container.hover');
		if (flip) {
			$('.charts').empty();
			flip.classList.toggle('hover');
		}
	});

});

_.map(document.querySelectorAll('.baseline'), function (a) {
	a.addEventListener('click', function (e) {
		e.preventDefault();
		if (!$('.flip-container svg').length)
			fetchBaseline.call(a);
		$('.flip-container').toggleClass('hover');
	}, false);
});

/*
	Get the data
*/
function submit (formData, cb) {

	if (!formData) return;
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/dashboard/get', true);
	xhr.onload = function xhrLoaded (e) {
		if (this.status == 200) {
			cb(this.response);
		}
	};
	xhr.send(formData);

};

function displayPlot () {
	console.log('called');
	var placeholder = document.querySelector('#placeholder');
	var spinner = document.querySelector('#front-spinner');
	spinner.style.display = 'block';
	placeholder.style.display = 'none';
	var params   = this.href.match(/\?.{0,}/g)[0].slice(1).split('&');
	var formdata = new FormData();

	params.forEach(function (p) {
		p = p.split('=');
		console.log(p);
		formdata.append(p[0],p[1]);
	});

	submit(formdata, function (data) {
		console.log(data);
		spinner.style.display = 'none';
		placeholder.style.display = 'block';
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
		parse(data);
	});

}

$('select.docNav').on('change', function () {
	location.href = this.value;
});

displayPlot.call(document.querySelector('.button a'));