$(document).ready(function() {
	$('#table').DataTable({
		"order": [
			[3, "desc"]
		], // default order column
		"columnDefs": [{
				"targets": [0],
				"orderable": false
			}, {
				"targets": [5],
				"orderable": false
			}] // disable sort column
	});
});