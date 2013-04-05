var buildBreadcrumbs = function (filter) {

	var breadcrumb = document.querySelector('.breadcrumbs')
	, li
	, a
	;


		li = document.createElement('li');
		a = document.createElement('a');

		a.href = '/dashboard?';

		if (QueryString.test) {
			['test', 'device'].forEach(function(i){
				if (QueryString[i] && typeof QueryString[i] != 'string')
					QueryString[i].forEach(function (t) {
						a.href += '&'+ i +'=' + t;
					});
				else
					a.href += '&'+ i +'=' + QueryString[i];
			});
		}

		a.innerHTML = 'Dashboard';
		li.appendChild(a);

		breadcrumb.appendChild(li);



		li = document.createElement('li');
		a = document.createElement('a');

		a.href = '/v2/view/results?';

		for (var i in QueryString) {
			if (i) {
				if (typeof QueryString[i] != 'string')
					QueryString[i].forEach(function (val) {
						a.href += '&' + i + '=' + val;
					});
				else
					a.href += '&' + i + '=' + QueryString[i];
			}
		}

		a.innerHTML = 'Average telemetry results';
		li.appendChild(a);

		breadcrumb.appendChild(li);
	

	li = document.createElement('li');
	a = document.createElement('a');

	a.href = '#';
	a.innerHTML = document.title;
	li.appendChild(a);

	breadcrumb.appendChild(li);

};

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
	var pair = vars[i].split("=");
		// If first entry with this name
	if (typeof query_string[pair[0]] === "undefined") {
	  query_string[pair[0]] = pair[1];
		// If second entry with this name
	} else if (typeof query_string[pair[0]] === "string") {
	  var arr = [ query_string[pair[0]], pair[1] ];
	  query_string[pair[0]] = arr;
		// If third or later entry with this name
	} else {
	  query_string[pair[0]].push(pair[1]);
	}
  } 
	return query_string;
} ();

buildBreadcrumbs();