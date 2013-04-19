var dashboard = document.querySelector('#dashboard-link');
var testNav = document.querySelector('.test-navigation');
var lis = document.querySelectorAll('#components li');
var spinner = document.querySelector('.spinner');

[].forEach.call(lis, function (li) {

	li.addEventListener('click', function () {

		var activeComponent = document.querySelector('li.active');
		
		if(activeComponent)
			activeComponent.classList.remove('active');

		var activeCategory = document.querySelector('ul.active');
		if(activeCategory)
			activeCategory.classList.remove('active');

		this.classList.add('active');
		var category = document.querySelector('.' + this.id);
		category.classList.add('active');


	});

});

// liButton.addEventListener('click', function () {

// 	var activeCategory = document.querySelector('li.active');
// 	if(activeCategory)
// 		activeCategory.classList.remove('active');
// 	this.classList.add('active');

// 	document.querySelector('ul.button_no_theme').classList.remove('active');
// 	document.querySelector('ul.button').classList.add('active');

// }, false);

// liButtonNoTheme.addEventListener('click', function () {

// 	var activeCategory = document.querySelector('li.active');
// 	if(activeCategory)
// 		activeCategory.classList.remove('active');
// 	this.classList.add('active');

// 	document.querySelector('ul.button').classList.remove('active');
// 	document.querySelector('ul.button_no_theme').classList.add('active');

// }, false);

[].forEach.call(document.querySelectorAll('li a:first-child'), function (el) {

	el.addEventListener('click', function (e) {

		document.querySelector('.plot li').innerHTML = document.querySelector('li.active').innerHTML + ' plot';

		var svg = document.querySelector('svg');
		if (svg)
			svg.parentNode.removeChild(svg);

		spinner.style.display = 'block';

		e.preventDefault();
		var params   = this.href.match(/\?.{0,}/g)[0].slice(1).split('&');
		var l = params.length;
		var formdata = new FormData();

		res[0] = [];
		res[1] = [];
		res[2] = [];

		resx[0] = [];
		resx[1] = [];
		resx[2] = [];

		allcommits = [];

		params.forEach(function (p) {
			p = p.split('=');

			formdata.append(p[0],p[1]);
			if(--l === 0) {
				submit(formdata, function (data) {
					spinner.style.display = 'none';
					plot(data, 550, 300);
				});
			}
		});

	});

});