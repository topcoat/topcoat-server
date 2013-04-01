var buildBreadcrumbs = function (filter) {

	var breadcrumb = document.querySelector('.breadcrumbs')
	, li
	, a
	;

	if(QueryString.test) {

		li = document.createElement('li');
		a = document.createElement('a');

		a.href = '/dashboard?test=' + QueryString.test + '&device=' + QueryString.device;
		a.innerHTML = 'Dashboard';
		li.appendChild(a);

		breadcrumb.appendChild(li);

	}

	if(QueryString.commit) {

		li = document.createElement('li');
		a = document.createElement('a');

		a.href = '/v2/view/results?test=' + QueryString.test + '&device=' + QueryString.device;
		a.href += '&commit=' + QueryString.commit[0];
		a.href += '&commit=' + QueryString.commit[1];
		a.innerHTML = 'Average telemetry results';
		li.appendChild(a);

		breadcrumb.appendChild(li);
	}

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