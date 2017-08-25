function askDelTask(taskName, taskID) {
	$('#yesnoContent').css({
		top: '150px',
		left: '0px',
		margin: '0px'
	});
	$('#modal-title').text("Delete Task");
	$('#modal-context').text("Do you want to remove　\"" + taskName + "\"　?");
	$('#yesBtn').attr("onclick", "delTask('" + taskID + "')");
	$('#yesBtn').attr("style","background-color: #F6434E;border-color: #F6434E;");
	$('#yesBtn').text("Yes, delete this task");
}

function delTask(taskID) {
	$.ajax({
		type: "POST",
		url: "/removeTask/" + taskID,
		success: function(d) {
			if (d == 'success') {
				window.location.reload();
			} else if (d == 'verify error') {
				window.location.assign('/');
			} else {
				alert(d);
				window.location.assign('/');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
}