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

var params   = window.location.href.match(/\?.{0,}/g),
	formdata = new FormData(),
	plotData = {
		'mean_frame_time (ms)' : [],
		'load_time (ms)' : [],
		'Layout (ms)' : []
	};
	toolTipInfo = {
		'mean_frame_time (ms)' : [],
		'load_time (ms)' : [],
		'Layout (ms)' : []
	}
	count = {
		'mean_frame_time (ms)' : 0,
		'load_time (ms)' : 0,
		'Layout (ms)' : 0
	};

params = (params) ? params[0].slice(1).split('&') : null;

var parse = function (data) {
	data = JSON.parse(data);
	data.forEach(filterResults);
	placeCheckboxes();
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

(function getUrlParams () {

	var l = params.length;
	params.forEach(function urlParams (p) {
		p = p.split('=');

		formdata.append(p[0],p[1]);
		if(--l === 0) {
			submit(formdata, parse);
		}
	});

})();