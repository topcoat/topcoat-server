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

var plot; // a closure with the data points

function generatePlot (plotData) {

	return function () {
		var points = [];
		for (var i in plotData) {
			var selected = $('input[name="' + i + '"]:checked').length || !$('input[name="' + i + '"]').length;
			if (selected) {
				points.push({
					data: plotData[i], label: i
				});
			}
		}

		$.plot("#placeholder", points, {
				series: {
					lines: {
						show: true
					},
					points: {
						show: true
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
	var $header = $('<header>')
		.html('<h2>Enable/Disable axes</h2>');
	$('.toggle').append($header);
	for (var i in plotData) {
		var checkbox = createCheckbox(i);
		checkbox.on('click', function () {
			plot();
		}).appendTo('.toggle');
	}
}

function createCheckbox (name) {
	var label = "<label class='topcoat-checkbox-label topcoat-checkbox-label--left' for='"+name+"'>"+ name + "</label>";
	var input = "<input type='checkbox' name='" + name +"' checked='checked' id='"+name+"'>";
	return $(input + label);
}

function showTooltip(x, y, contents) {
	$("<div id='tooltip' class='plot__tooltip'>" + contents + "</div>").css({
		top: y + 15,
		left: x - 50
	}).appendTo("body").fadeIn(200);
}

var previousPoint = null;
$("#placeholder").bind("plothover", function (event, pos, item) {

	if ($("#enablePosition:checked").length > 0) {
		var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
		$("#hoverdata").text(str);
	}

	if (item) {
		if (previousPoint != item.dataIndex) {

			previousPoint = item.dataIndex;

			$("#tooltip").remove();
			var x = item.datapoint[0].toFixed(2),
			y = item.datapoint[1].toFixed(2);
			var content = item.series.label + " = " + y;
			content += deltaValue(item.series.label, parseInt(x, 10));
			showTooltip(item.pageX, item.pageY, content);
		}
	} else {
		$("#tooltip").remove();
		previousPoint = null;
	}
});

function deltaValue (key, x) {
	var content = '';
	if (x) {
		var delta = plotData[key][x][1] - plotData[key][x-1][1];
		content += '<br> delta ' + (delta.toString()).slice(0,8) + ' ms';
		content += (delta < 0 ? ' (better)' : ' (worse)');
	}
	/*toolTipInfo defined in baseline.jplot.js */

	content += '<br> commit = ' + toolTipInfo[key][x].commit.substring(0,8);
	content += '<br> date = ' + (new Date(toolTipInfo[key][x].date)).toString().substring(0, 15);
	content += '<br> test = ' + toolTipInfo[key][x].test;
	return content;
}