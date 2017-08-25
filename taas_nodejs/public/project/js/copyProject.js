function askCopyProj(projName, projID) {
	$('#textboxContent').css({
		top: '106px',
		left: '50px', 
		margin: '0px',
		width: '500px',
		height: '220px'
	});
	$('.modal-title').text("Copy \"" + projName + "\" Project");
	$('.textfield').attr("placeholder", "Copy name");
	$('.yesBtn').attr("onclick", "copyProj('" + projID + "')");
	$('.yesBtn').text("Copy it!");
	$('.yesBtn').attr("style", "background-color: #F6434E;border-color: #F6434E;");
}

function copyProj(projID) {
	$.ajax({
		type: "POST",
		url: "/copyProject",
		data: {
			projID: projID,
			copyName: $('.textfield').val()
		},
		success: function(d) {
			switch(d){
				case 'verify error':
					window.location.replace('/');
					break;
				case 'success':
					window.location.reload();
					break;
				default:
					alert(d);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
}