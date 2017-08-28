function askDelProj(projName, projID, permission) {
    if(permission) {
        // access permitted
        $('#yesnoContent').css({
            top: '150px',
            left: '0px',
            margin: '0px'
        });
        $('#modal-title').text("Delete Project");
        $('#modal-context').text("Do you want to remove　\"" + projName + "\"　?");
        $('#yesBtn').attr("onclick", "delProj('" + projID + "')");
        $('#yesBtn').attr("style", "background-color: #F6434E;border-color: #F6434E;");
        $('#yesBtn').text("Yes, delete this project");
	} else {
	    // access blocked
	    $('.modal-title').text("Permission denied.");
	    $('#delProj'+projID).attr("data-target", "#warningModal");
	}
}

function delProj(projID) {
	$.ajax({
		type: "POST",
		url: "/fProjDestroy/" + projID,
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