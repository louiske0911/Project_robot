function askDelShare(projID,delProjEmail) {
	$('#yesnoShareContent').css({
		top: '150px',
		left: '0px',
		margin: '0px'
	});
	$('#modal-title-share').text("Delete Sharing Project");
	$('#modal-context-share').text("Do you want to remove　\"" + delProjEmail + "\"　?");
	$('#yesShareBtn').on("click",function(){
	    delShare(projID,delProjEmail);
	});
	$('#yesShareBtn').attr("style", "background-color: #F6434E;border-color: #F6434E;");
	$('#yesShareBtn').text("Yes, delete sharing");
}

function delShare(projID,delProjEmail) {
    $.ajax({
		type: "POST",
		url: "/shareProjDestroy/" + projID,
		data: {
			delProjEmail: delProjEmail
		},
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
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
}