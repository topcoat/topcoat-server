function plot () {
	var barW = 45,
		h = 600,
		textColor = 'rgba(0,0,0,.3)',
		barPadding = 5,
		chartPrecision = 30;

	var tooltip = d3.select('body').append('div')
				.attr('class', 'tooltip')
				.text('tooltip');

	for (var i in plotData) {
		var data = plotData[i];
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
						.style('left', d3.event.pageX + 'px')
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
