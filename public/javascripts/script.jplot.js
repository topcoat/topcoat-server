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

var plot;
var toolTipInfo = {
	'mean_frame_time (ms)' : [],
	'load_time (ms)' : [],
	'Layout (ms)' : []
};
var plotData = {
	'mean_frame_time (ms)' : [],
	'load_time (ms)' : [],
	'Layout (ms)' : []
}

var parse = function (data) {
	data = JSON.parse(data);
	placeCheckboxes();
	plot = generatePlot(createPlotData(data));
	plot();
};

/*
	filters through the results
	separates the base results from the rest
*/
function createPlotData (data) {
	var count = {
		'mean_frame_time (ms)' : 0,
		'load_time (ms)' : 0,
		'Layout (ms)' : 0
	};
	data.forEach(function (d) {
		for (var row in d.result) {
			if (plotData.hasOwnProperty(row)) {
				toolTipInfo[row].push({
					date: d.date,
					commit: d.commit,
					test: d.test
				});
				plotData[row].push([count[row]++, parseFloat(d.result[row])]);
			}
		}
	});

	return plotData;
}

function generatePlot (plotData) {

	return function () {
		// if any of the checboxes are unchecked
		// remove the coresponding data
		var points = [];
		for (var i in plotData) {
			var selected = $('input[name="' + i + '"]:checked').length || !$('input[name="' + i + '"]').length;
			if (selected) {
				points.push({
					data: plotData[i], label: i
				});
			}
		}

		// call the plot
		$.plot("#placeholder", points, {
				series: {
					lines: {
						show: true
					},
					points: {
						show: true,
						fill: true,
						radius: 6
					}
				},
				grid: {
					hoverable: true,
					clickable: true
				},
				yaxis: {
					min: -1.2,
					max: maxValue(plotData) + 20
				},
				xaxis: {
					ticks: xLabels(plotData)
				}
		});
	}
}

function maxValue (plotData) {
	var maxValue = 0; // used to scale the plot
	_.map(plotData, function (val, k){
		val.forEach(function (arr) {
			if (arr[1] > maxValue)
				maxValue = arr[1];
		});
	})

	return maxValue;
}

function xLabels (plotData) {
	var ticks = [];
	_.map(plotData, function (v, k) {
		_.map(toolTipInfo[k], function (val, key) {
			ticks[key] = [key, val.commit.substring(0,7) + '<br>' + val.date.substring(0,10)];
		})
	});
	return ticks;
}

function placeCheckboxes () {
	var html = $('<div></div>');
	for (var i in plotData) {
		var checkbox = createCheckbox(i);
		checkbox.on('click', function () {
			plot();
		});
		html.append(checkbox);
	}
	html.appendTo('.toggle:empty');
}

function createCheckbox (name) {
	var label = "<label class='topcoat-checkbox-label topcoat-checkbox-label--left' for='"+name+"'>"+ name + "</label>";
	var input = "<input type='checkbox' name='" + name +"' checked='checked' id='"+name+"'>";
	return $(input + label);
}

function showTooltip(x, y, contents) {

	var totalW = $('body').width();

	var coords = {
		top: y + 20,
		left: (totalW < 500) ? (totalW - 300)/2 : x - 150
	}

	var $t = $("<div id='tooltip' class='plot__tooltip arrow--top'></div>")
		.css(coords).html(contents).appendTo('body').fadeIn(200);

	var timeoutId = setTimeout(removeTooltip($t), 2000);
	$t.on('hover', removeTimeout(timeoutId));
}

function removeTimeout (id) {
	return function () {
		window.clearTimeout(id);
	}
}

function removeTooltip ($t) {
	return function () {
		$t.remove();
	}
}

var previousPoint = null;

$("#placeholder").bind("plotclick", createTooltip);
$("#placeholder").bind("plothover", createTooltip);

function createTooltip (event, pos, item) {

	if (item) {
		if (previousPoint != item.dataIndex) {

			previousPoint = item.dataIndex;

			$("#tooltip").remove();
			var x = item.datapoint[0].toFixed(2),
			y = item.datapoint[1].toFixed(2);

			var content = document.createElement('table');
			content.appendChild(createRow('Total time', y + ' ms'));
			content.appendChild(createRow('Metric', item.series.label));
			content.appendChild(calculateDelta(item.series.label, parseInt(x, 10)));
			showTooltip(item.pageX, item.pageY, content);
		}
	} else {
		// $("#tooltip").remove();
		previousPoint = null;
	}
}

// pass as many arguments
// will create a tr with every argument wrapped in a <td>
function createRow () {
	var tr = document.createElement('tr');
	_.map(_.toArray(arguments), function (v, k) {
		var td = document.createElement('td');
		if (typeof v == 'object')
			td.appendChild(v)
		else
			td.innerHTML = v;
		tr.appendChild(td);
	});
	return tr;
}

// part of the tooltip info
function calculateDelta (key, x) {
	var content = document.createDocumentFragment();
	if (x) {
		var delta = plotData[key][x][1] - plotData[key][x-1][1];
		var betterWorse = delta < 0 ? 'better' : 'worse';
		var row = createRow('Delta', (delta.toString()).slice(0,8) + ' ms ' + betterWorse);
		row.classList.add(betterWorse);
		content.appendChild(row);
	}
	/*toolTipInfo defined in baseline.jplot.js */
	var commit = document.createElement('a');
	if (document.querySelector('.active h2'))
		var repo = document.querySelector('.active h2').dataset.github;
	commit.innerHTML = toolTipInfo[key][x].commit.substring(0,8);
	commit.href = 'https://github.com/topcoat/' + repo + '/commit/' + toolTipInfo[key][x].commit;
	content.appendChild(createRow('Commit', commit));
	content.appendChild(createRow('Date', (new Date(toolTipInfo[key][x].date)).toString().substring(0, 15)));
	content.appendChild(createRow('Component', toolTipInfo[key][x].test));
	return content;
}