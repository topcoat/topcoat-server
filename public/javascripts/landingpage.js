var dashboard = document.querySelector('#dashboard-link');
var testNav = document.querySelector('.test-navigation');
var liButton = document.querySelector('li.button');
var liButtonNoTheme = document.querySelector('li.button_no_theme');

liButton.addEventListener('mouseover', function () {

	document.querySelector('ul.button_no_theme').classList.remove('active');
	document.querySelector('ul.button').classList.add('active');

}, false);

liButtonNoTheme.addEventListener('mouseover', function () {

	document.querySelector('ul.button').classList.remove('active');
	document.querySelector('ul.button_no_theme').classList.add('active');

}, false);

dashboard.addEventListener('mouseover', function () {

	testNav.classList.add('active');

}, false);