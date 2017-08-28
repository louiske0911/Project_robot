
function askShareProj(projID) {

    var email = $('input[id="name"]').val();

	if(email!=null || email!=""){

	    var position = $('#target').val();
        ShareProj(projID,email,position);




    }
}
function ShareProj(projID,email,position) {


	$.ajax({
		type: "POST",
		url: "/shareProject",
		data: {
			projID: projID,
			shareEmail: email,
			position: position
		},
		success: function(d) {
		console.log(d);
			switch(d){
				case 'verify error':
					window.location.replace('/');
					break;
				case 'repeat email':
					alert('email repeat')
					break;
				case 'success':
//				    updateProjectTable(projID,projName,email)
					window.location.reload();
					break;
				default:
                    alert(d);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});

}


