var anchors = document.querySelectorAll('a');
[].forEach.call(anchors, function(el){
	el.addEventListener('click', function () {

		var className = this.id;
		console.log('._' + className);
		document.querySelector('._' + className).classList.toggle('hide');

	}, false);
});