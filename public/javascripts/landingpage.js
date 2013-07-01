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

var dashboard = document.querySelector('#dashboard-link');
var testNav = document.querySelector('.test-navigation');
var lis = document.querySelectorAll('#components li');
var spinner = document.querySelector('.spinner');
var t;
var filter 	 = ['mean_frame_time (ms)', 'load_time (ms)', 'Layout (ms)'];

[].forEach.call(lis, function (li) {

	li.addEventListener('click', function () {

		var activeComponent = document.querySelector('li.active');

		if(activeComponent)
			activeComponent.classList.remove('active');

		var activeCategory = document.querySelector('ul.active');
		if(activeCategory) {
			activeCategory.classList.remove('active');
			activeCategory.classList.add('not-active');
		}

		this.classList.add('active');
		var category = document.querySelector('.' + this.id);
		category.classList.add('active');

		displayPlot.call(document.querySelector('.' + this.id + ' a'));

	});

});

function displayPlot () {

	spinner.style.display = 'block';
	var params   = this.href.match(/\?.{0,}/g)[0].slice(1).split('&');
	var l = params.length;
	var formdata = new FormData();

	params.forEach(function (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, function (data) {
				spinner.style.display = 'none';
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
	});

}

document.querySelector('select.docNav').addEventListener('change', function () {
	location.href = this.value;
})

displayPlot.call(document.querySelector('.button a'));