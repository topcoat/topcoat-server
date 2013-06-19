var maxValue = 0;

function plot () {
	var points = [];
	maxValue = 0;
	for (var i in plotData) {
		if ($('input[name="' + i + '"]:checked').length || !$('input[name="' + i + '"]').length) {
			points.push({
				data: plotData[i], label: i
			});
			plotData[i].forEach(function (arr) {
				if (arr[1] > maxValue)
					maxValue = arr[1];
			})
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
			max: maxValue + 20
		}
	});
}

function placeCheckboxes () {
	for (var i in plotData) {
		$("<label><input type='checkbox' name='" + i +
			"' checked='checked'></input>"
			+ i + "</label>")
			.on('click', plot)
			.appendTo('p');
	}
}

function showTooltip(x, y, contents) {
	$("<div id='tooltip'>" + contents + "</div>").css({
		position: "absolute",
		display: "none",
		top: y + 15,
		left: x - 50,
		border: "1px solid #fdd",
		padding: "5px",
		"background-color": "#fee",
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
			showTooltip(item.pageX, item.pageY,
			    content);
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
	content += '<br> commit: ' + toolTipInfo[key][x].commit.substring(0,8);
	content += '<br> date: ' + toolTipInfo[key][x].date;
	return content;
}

$("#placeholder").bind("plotclick", function (event, pos, item) {
	if (item) {
		$("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
		plot.highlight(item.series, item.datapoint);
	}
});