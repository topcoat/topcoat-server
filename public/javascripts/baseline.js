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

  var filter = [
			'mean_frame_time (ms)',
			'load_time (ms)',
			'Layout (ms)'
		],
		plotDataBaseline = {}
	;

/*
	filters through the results
	separates the base results from the rest
*/
var filterBaselineResults = function (d) {
	filter.forEach(function baseOrStandard (f) {
		if (d.result[f]) {
			if (plotDataBaseline[f]) {
				if (d.test.match(/base/g))
					plotDataBaseline[f][0] = d.result[f];
				else
					plotDataBaseline[f].push(d.result[f]);
			} else {
				if (d.test.match(/base/g))
					plotDataBaseline[f] = [d.result[f]];
				else
					plotDataBaseline[f] = ['', d.result[f]];
			}
		}
	});
};

function resultsFilter (params) {

	var formdata = new FormData();

	params.forEach(function urlParams (p) {
		p = p.split('=');
		formdata.append(p[0],p[1]);
	});

	return formdata;
}

function fetchBaseline () {

	var spinner = document.querySelector('#back-spinner');
	spinner.style.display = 'block';
	plotDataBaseline = {};
	var params   = this.href.match(/\?.{0,}/g)[0].slice(1).split('&');
	var formdata = new FormData();

	params.forEach(function (p) {
		p = p.split('=');
		console.log(p[0],p[1]);
		formdata.append(p[0],p[1]);
	});

	if (params.length) {
		submit(resultsFilter(params), function (data) {
			spinner.style.display = 'none';
			data = JSON.parse(data);
			var results = data.map(filterBaselineResults);
			plotBaseline(plotDataBaseline);
		});
	}
};

function plotBaseline (plotDataBaseline) {
	var barW = 35,
		h = 500,
		textColor = 'rgba(0,0,0,.3)',
		barPadding = 5,
		chartPrecision = 30;

	var tooltip = d3.select('body').append('div')
				.attr('class', 'plot__tooltip arrow--left')
				.text('tooltip');

	for (var i in plotDataBaseline) {
		var data = plotDataBaseline[i];
		var chart = d3.select('.charts').append("svg")
					.attr("class", "chart")
					.attr("width", '30%')
					.attr("height", h)
					.append('g')
					.attr('transform', 'translate(10,45)');

		var l = data.length + 1;

		var x = d3.scale.linear()
				.domain([0, d3.max(data)])
				.range([0, h]);

		var y = d3.scale.ordinal()
				.domain(data)
				.rangeBands([0, h]);

     chart.selectAll('text')
       .data([i])
       .enter()
       .append('text')
       .text(function (d) { console.log(d);return d; })
       .attr('font-size', '20px')
       .attr('font-weight', 'bold')
       .attr('x', 0)
       .attr('y', - barPadding * 4);

		chart.selectAll('text')
			.data(data)
			.enter()
			.append('text')
			.text(function (d) { return d; })
			.attr('x', function (d, i) { return barW * i + 1; })
			.attr('y', function (d) { return h - x(d) - barPadding})
			.attr('font-size', '11px')
			.text(function(d) { return parseInt(d, 10) + ' ms'; })
			.attr('text-anchor', 'right')

		chart.selectAll('line')
			.data(x.ticks(chartPrecision))
			.enter().append('line')
			.attr('x1', - barW / 2)
			.attr('x2', l * barW + barW/2)
			.attr('y1', x)
			.attr('y2', x)
			.style('stroke', textColor);

		chart.selectAll("rect")
			.data(data)
			.enter().append("rect")
			.attr("x", function(d, i) { return barW * i + 1; })
			.attr("y", function(d,i) { return h - x(d); })
			.attr("width", barW - barPadding)
			.attr("height", function(d, i) { return x(d); })
			.attr('delta', data[0])
			.on('mouseover', function (d) {
				var _baselineTime = parseFloat(d3.select(this).attr('delta'));
				tooltip.transition()
					.duration(200);
				tooltip.html('<p>Time is ' + d + ' ms </p>' + displayMessage(d - _baselineTime) + '</p>')
						.style('opacity', 1)
						.style('left', d3.event.pageX + 28 + 'px')
						.style('top', d3.event.pageY - 28 + 'px');
			})
			.on('mouseout', function (d) {
				tooltip.transition().duration(500).style('opacity', 0);
			});

		chart.selectAll('.rule')
			.data(x.ticks(chartPrecision))
			.enter().append('text')
			.attr('class', 'rule')
			.attr('x', l * barW)
			.attr('y', x)
			.attr('dy', -barPadding)
			.attr('text-anchor', 'middle')
			.style('fill', textColor)
			.attr('font-size', '11px')
			.text(String);

		chart.append('line')
			.attr('y1', h-47)
			.attr('y2', h-47)
			.attr('x1', -barW/2)
			.attr('x2', l*barW + barW/2)
			.style('stroke-width', '3px');
	}
}

function displayMessage (value) {
	if (value) return '<p>Delta is '+ value +' ms</p>';
	if (isNaN(value)) return '<p>No baseline results available</p>';
	return '<p>This is the baseline</p>';
}
