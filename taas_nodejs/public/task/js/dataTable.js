$(document).ready(function() {
	var table = $('#table').DataTable({
		"order": [
			[4, "asc"]
		], // default order column
		"columnDefs": [{
				"targets": [0],
				"orderable": false
			}, {
				"targets": [1],
				"width": "15%"
			}, {
				"targets": [2],
				"width": "20%"
			}, {
				"targets": [3],
				"width": "20%"
			}, {
				"targets": [4]
			}, {
				"targets": [5],
				"orderable": false,
				"width": "20%"
			}] // disable sort column
	});

	var column4 = table.column(4);
	$(column4.header()).html("Level" + "&nbsp;&nbsp;<button id='selectAllBtn'>Select all</button>");
	var column4 = table.column(5);
	$(column4.header()).html("<button id='pipelineBtn'>Run pipeline</button>");

	$("button[id=selectAllBtn]").click(function() {
		$.ajax({
			type: "POST",
			url: "/wakeAllTasks",
			data: {
				projID: $("input#projid").val()
			},
			success: function(data) {
				window.location.reload();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	});

	$("button[id=pipelineBtn]").click(function() {
		$.ajax({
			type: "POST",
			url: "/pipeline",
			data: {
				projID: $("input#projid").val()
			},
			success: function(data) {
				window.location.reload();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	});
});