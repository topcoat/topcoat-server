var r = Raphael(0, 200, 1200, 900) // offset offset width and height
	, x = [] // x axis values
	, y = [] // y axis values
	, platforms = [] // name of platform
	, testCount = []; // number of tests

function getResults() {
	var xhr = new XMLHttpRequest();
	var testName = location.pathname.split('/').pop(-1);

	// json/<query_for_this_field>/<that_has_this_value> // in our case json/test/test_name													
	xhr.open('GET', '../../json/test/' + testName, true);
	xhr.onload = function(e) {
    if (this.status == 200) {
		var res = JSON.parse(this.responseText); // get the response
		var count = res.length; // and the length of the response
		document.querySelector('span').innerHTML = res.length + ' '; // print this on the page

		res.forEach(function (r) {
			if(!r.result.match(/x [0-9,]{0,10}/g)) { count--; return; } // filter out invalid / dummy tests
			
			var _platform;
			if(location.toString().split('?').length>1)
				_platform = (r.device || 'Desktop/Laptop') + ' with ' + r.browser + ' ' +(r.version || '');
			else
				_platform = (r.device || 'Desktop/Laptop') + ' with ' + r.browser;

			var result;
			if(isNaN(r.result)) {
				var result = r.result.match(/x [0-9,]{0,10}/g).toString(); // get the number of ops/sec
				result = parseInt(result.slice(2,result.length));
			} else {
				result = parseInt(r.result);
			}
			
			 // round up the numbers 92,123 becomes 90 etc
			(result%10 > 5) ? result += 10-result%10 : result -= result%10;
			// (doesn't really matter we want visual indicators not precision)
			
			if(platforms.indexOf(_platform) === -1) // platforms is an the Y axis array
				platforms.push(_platform); // if it's a new test add it
			
			// very hackish way that return an array 0 and 1 where 1 means bubble overlap
			var occurrencesX = x.map(function(val, idx){ if(val === result) return idx; return 0 });
			var overlap = occurrencesX.map(function(val){ if(y[val] === platforms.indexOf(_platform)) return 1; return 0 }); 

			if(overlap.indexOf(1) === -1) { // if no overlaps
				x.push(result);
				y.push(platforms.indexOf(_platform));
				testCount.push(1);
			} else // it overlaps so I increment the bubble already in the page
				testCount[overlap.indexOf(1)]++;

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
		10, -190, 1200, 900,
		x, // x
		y, // y
		testCount, {
			max: 15,
			axisystep:platforms.length-1,
			axisylabels: platforms,
			axisxstep: 25,
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