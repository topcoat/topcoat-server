[].forEach.call(document.querySelectorAll('.date'), function(el, idx) {
	var date = el.innerText;
	el.innerText = date.substring(4,10);
});

[].forEach.call(document.querySelectorAll('.commit'), function(el, idx) {
	var commit = el.innerText;
	el.innerText = commit.substring(0,7);
});

var trs = document.querySelectorAll('tbody>tr');
[].forEach.call(trs, function(el, idx) {
	if(!el.classList.contains('hide'))
		el.addEventListener('click', function () {
			var i = idx + 1;
			for ( ; i <= idx + 3; ++i)
				trs[i].classList.toggle('hide');
		});
});