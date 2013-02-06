!!(function(){

	var select = {
		browser : document.querySelector('.select-browser')
	}
	,	trs = document.querySelectorAll('tbody tr');

	select.browser.addEventListener('change', function () {

		var value = this.value;
		console.log(value);

		[].forEach.call(trs, function (tr) {

			if (!tr.classList.contains(value))
				tr.classList.add('hide');
			else
				tr.classList.remove('hide');

		});

	}, false);

})();