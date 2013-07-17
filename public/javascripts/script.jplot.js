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
					points: {show:true, fill:true, radius:6}
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

function circle(ctx, x, y, radius, shadow) {
	ctx.arc(x, y, radius + 2, 0, shadow ? Math.PI : Math.PI * 2, false);
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
	var $t = $("<div id='tooltip' class='plot__tooltip'></div>").css({
		top: y + 15,
		left: x - 130
	}).html(contents).appendTo("body").fadeIn(200);
	setTimeout(function () {
		$t.remove();
	}, 2000);
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

			var content = document.createElement('table');
			content.appendChild(createRow('Total time', y + ' ms'));
			content.appendChild(createRow('Metric', item.series.label));
			content.appendChild(calculateDelta(item.series.label, parseInt(x, 10)));
			showTooltip(item.pageX, item.pageY, content);
			console.log(content);
		}
	} else {
		// $("#tooltip").remove();
		previousPoint = null;
	}
});

$('#placeholder').bind('hover', alert);

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
	commit.innerHTML = toolTipInfo[key][x].commit.substring(0,8);
	commit.href = 'https://github.com/topcoat/topcoat/commit/' + toolTipInfo[key][x].commit;
	content.appendChild(createRow('Commit', commit));
	content.appendChild(createRow('Date', (new Date(toolTipInfo[key][x].date)).toString().substring(0, 15)));
	content.appendChild(createRow('Component', toolTipInfo[key][x].test));
	console.log(content);
	return content;
}