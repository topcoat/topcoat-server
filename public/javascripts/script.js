var deleteBtn = document.querySelector('.delete');
deleteBtn.addEventListener('click', function(){
	var selection = document.querySelectorAll('input[type=checkbox]:checked');
	var tests = [].map.call(selection, function(s){
		return s.id;
	});

	var formData = new FormData();
	formData.append('ids', tests);

	var xhr = new XMLHttpRequest();
	xhr.open('DELETE', '/remove/db', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			console.log(this.responseText);
		}
	};

	xhr.send(formData);



}, false);