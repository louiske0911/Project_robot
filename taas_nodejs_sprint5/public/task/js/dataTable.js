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
    // get permission settings
    var projID = $("input[id='projid']").val();
	$.ajax({
	    type: "POST",
	    url: "/getPermission",
	    data: {
	        projID: projID
	    },
	    success: function(data) {
	        var edittasks = data.edittasks;
	        var runtasks = data.runtasks;
	    },
	    async: false,
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
        }
	});

	$("button[id=selectAllBtn]").click(function() {
	    if (edittasks) {
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
		} else {
		    // access blocked
            $("button[id=selectAllBtn]").attr("data-toggle", "modal");
            $("button[id=selectAllBtn]").attr("data-target", "#warningModal");
		}
	});

	$("button[id=pipelineBtn]").click(function() {
		if (runtasks) {
            $.ajax({
                type: "POST",
                url: "/pipeline",
                data: {
                    projID: $("input#projid").val(),
                },
                success: function(data) {
                    if (data.permission == "true") {
                        window.location.reload();
                    } else {
                        $("button[id=pipelineBtn]").attr("data-toggle", "modal");
                        $("button[id=pipelineBtn]").attr("data-target", "#warningModal");
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
                }
            });
		} else {
		    // access blocked
            $("button[id=pipelineBtn]").attr("data-toggle", "modal");
            $("button[id=pipelineBtn]").attr("data-target", "#warningModal");
		}
	});
});