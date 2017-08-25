$(document).ready(function() {
	/*$.ajax({
		type: "POST",
		url: "/getTasksOrder",
		data: {
			projID: $("input#projid").val()
		},
		success: function(data) {
			var tasksOrder = JSON.parse(data);
			$(".level").each(function() {
				var taskName = $(this).closest('td').siblings().find(".taskName").text();
				$(this).text(tasksOrder[taskName]);
			});			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});*/
});

function upLevel(taskID) {
	$.ajax({
		type: "POST",
		url: "/upOrderTask",
		data: {
			taskID: taskID
		},
		success: function(data) {
			window.location.reload();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
	return false;
};

function downLevel(taskID) {
	$.ajax({
		type: "POST",
		url: "/downOrderTask",
		data: {
			taskID: taskID
		},
		success: function(data) {
			window.location.reload();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
	return false;
};

function enableContDownstream(taskID, enable) {
	console.log('enableContDownstream: ' + enable);
	$.ajax({
		type: "POST",
		url: "/contDownstreamTask",
		data: {
			taskID: taskID,
			enable: enable? 'true': 'false'
		},
		success: function(data) {
			window.location.reload();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
	return false;
}

function triggerSleep(taskID, taskLv) {
	if (taskLv == 0) {
		// wake up
		$.ajax({
			type: "POST",
			url: "/wakeTask",
			data: {
				taskID: taskID
			},
			success: function(data) {
				window.location.reload();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	} else {
		// sleep
		$.ajax({
			type: "POST",
			url: "/sleepTask",
			data: {
				taskID: taskID
			},
			success: function(data) {
				window.location.reload();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	}
	return false;
}
