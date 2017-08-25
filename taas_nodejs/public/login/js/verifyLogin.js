$(document).ready(function() {
	$("#alertBar").hide();
	// button click to log in
	$('#loginBtn').click(function() {
		$.ajax({
			type: "POST",
			url: "/verifylogin",
			data: {
				user: $("#user").val(),
				password: $("#password").val()
			},
			async: false,
			success: function(d) {
				if (d == 'success') {
					window.location.replace("/dashboard");
				} else {
					showMsg(d);
					clearText('verifylogin');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	});
	// key press 'enter' to log in
	$('#user').keypress(function(e) {
		var key = e.which;
		if (key == 13) {
			$('#loginBtn').trigger('click');
		}
	});
	$('#password').keypress(function(e) {
		var key = e.which;
		if (key == 13) {
			$('#loginBtn').trigger('click');
		}
	});
});