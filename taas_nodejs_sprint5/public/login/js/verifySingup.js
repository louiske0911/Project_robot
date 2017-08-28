$(document).ready(function() {
	$("#alertBar").hide();
	// button click to log in
	$('#btnSignup').click(function() {
		if (check()) {
			$.ajax({
				type: "POST",
				url: "/verifysignup",
				data: {
					signUpUser: $("#signUpUser").val(),
					signUpEmail: $("#signUpEmail").val(),
					signUpPassword: $("#signUpPassword").val(),
					signUpConfirmPassword: $("#signUpConfirmPassword").val()
				},
				async: false,
				success: function(d) {
					if (d == 'Success! Please varify your mail and login account.') {
						showMsg(d);
						clearText("verifysignup");
						setTimeout(function() {
							window.location.replace("/")
						}, 20000);
					} else if (d == 'Fail! Please singup again!' || d == 'email already exists.' || d == 'username already exists.') { //add 20160225 by kristen
						showMsg(d);
						setTimeout(function() {
							window.location.replace("/")
						}, 20000);
					} else if (d == 'success') {
						window.location.replace("/");
					} else {

						showMsg(d);
						clearText("verifysignup");
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
				}
			});
		}
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

function clearText(funName) {
	if (funName == "verifysignup") {
		$("#signUpUser").val('');
		$("#signUpEmail").val('');
		$("#signUpPassword").val('');
		$("#signUpConfirmPassword").val('');
	} else if (funName == "verifylogin") {
		$("#user").val('');
		$("#password").val('');
	} else if (funName == "ldaplogin") {
		$("#ldapUser").val('');
		$("#ldapPassword").val('');
	}
}

function showMsg(txt) {
	console.log(txt);
	if ($("#htmlMsg").text().length > 0)
		$("#htmlMsg").text("");

	$("#alertBar").show();
	$("#alertBar").text(txt);
}