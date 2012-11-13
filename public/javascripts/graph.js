var r = Raphael(10, 50, 900, 400); // offset offset width and height

var x = []; // x axis values
var y = []; // y axis values
var tests = ['li simple', 'box-shadow', 'border-radius', 'bootstrap', 'foundation']; // name of tests
var testCount = []; // number of tests

function getResults() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '../../json/Chrome', true);
	xhr.onload = function(e) {
    if (this.status == 200) {
		var res = JSON.parse(this.responseText); // get the response
		var count = res.length; // and the length of the response
		
		res.forEach(function (r) { // for each result
			var result = r.result.match(/x [0-9,]{0,10}/g).toString(); // get the number of ops/sec
			result = parseInt(result.slice(2,result.length));
			
			var xPos = x.indexOf(result); // check the x Axis
			
			if(y[xPos] !== tests.indexOf(r.test)) { // check the y Axis and add the bubble only if it doesn't overlap
				x.push(result);
				y.push(tests.indexOf(r.test));
				testCount.push(1);
			} else { // it overlaps so I increment the bubble already in the page
				var c = result;
				testCount[x.indexOf(c)]++;
			}

			if(--count === 0) { // if === 0 we finished parsing, let's display!
				render();
			}

      });
    }
  };

	xhr.send();
}

function render() {
		r.dotchart(
		10, 0, 900, 400,
		x, // x
		y, // y
		testCount, {
			max: 10,
			axisystep: 4,
			axisylabels: ['simple inserts', 'box-shadow', 'border-radius', 'bootstrap', 'foundation'],
			heat: true,
			axis: '0 0 1 1'
		}
	).hover(function () {
		this.marker = this.marker || r.tag(this.x, this.y, this.value, 45, this.r).insertBefore(this);
		this.marker.show();
	}, function () {
		this.marker && this.marker.hide();
	});
}

getResults(); // fetch the JSON