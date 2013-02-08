	var months = [];
	var dotsy = [];
	var path;

	var xhr = new XMLHttpRequest();
	var testName = location.pathname.split('/').pop(-1);

	xhr.open('GET', '../../json/test/' + testName, true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			var res = JSON.parse(this.responseText); // get the response
			var count = res.length; // and the length of the response
			document.querySelector('span').innerHTML = res.length + ' '; // print this on the page
			console.log(res);
			res.forEach(function (r) {

				var commit = r.commit.substring(0,7);
				var idx = months.indexOf(commit);
				if (idx == -1) {
					months.push(commit);
					idx = months.indexOf(commit);
				}
				dotsy[idx] = dotsy[idx] || [];
				dotsy[idx].push(parseInt(r.result, 10));


			});
			console.log(dotsy);
			render();
		}
	};

	xhr.send();

	//render();

function render () {
	  var r = Raphael("holder", 620, 250),
		e = [],
		clr = [],
		values = [],
		now = 0,
		month = r.text(310, 27, months[now]).attr({fill: "#333", stroke: "none", "font": '100 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'}),
		rightc = r.circle(364, 27, 10).attr({fill: "#fff", stroke: "none"}),
		right = r.path("M360,22l10,5 -10,5z").attr({fill: "#000"}),
		leftc = r.circle(256, 27, 10).attr({fill: "#fff", stroke: "none"}),
		left = r.path("M260,22l-10,5 10,5z").attr({fill: "#000"}),
		c = r.path("M0,0").attr({fill: "none", "stroke-width": 4, "stroke-linecap": "round"}),
		bg = r.path("M0,0").attr({stroke: "none", opacity: .3})
	function randomPath(length, j) {
		var path = "",
			x = -30,
			y = 0;
		dotsy[j] = dotsy[j] || [];
		
		(dotsy[j].length) ? length = dotsy[j].length : length = length
		console.log(length);
		for (var i = 0; i < length; i++) {
			if(isNaN(dotsy[j][i]) || dotsy[j][i] < 1000) {
				dotsy[j][i] = Math.round(Math.random() * 200);
			} else {
				dotsy[j][i] /= 10;
			}
			if (i) {
				x += 620 / (length-1);
				y = 250 - dotsy[j][i];
				console.log(y, dotsy[j][i]);
				path += "," + [x, y];
			} else {
				path += "M" + [10, (y = 240 - dotsy[j][i])] + "R";
			}
		}
		return path;
	}
	for (var i = 0; i < 4; i++) {
		values[i] = randomPath(3, i);
		clr[i] = Raphael.getColor(1);
	}
	c.attr({path: values[0], stroke: clr[0]});
	bg.attr({path: values[0] + "L590,250 10,250z", fill: clr[0]});
	var animation = function () {
		var time = 500;
		if (now == 4) {
			now = 0;
		}
		if (now == -1) {
			now = 3;
		}
		var anim = Raphael.animation({path: values[now], stroke: clr[now]}, time, "<>");
		c.animate(anim);
		bg.animateWith(c, anim, {path: values[now] + "L590,250 10,250z", fill: clr[now]}, time, "<>");
		month.attr({text: months[now]});
	};
	var next = function () {
			now++;
			animation();
		},
		prev = function () {
			now--;
			animation();
		};
	rightc.click(next);
	right.click(next);
	leftc.click(prev);
	left.click(prev);
}