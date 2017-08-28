/*
 * LDAP login
 * @fileoverview This file has functions related to LDAP login.
 * Rivision:
 * 2016/02/25(Kristen)
 *  submitJira, submitSpiraTest when LDAP submit.
 * 
 *  
 *
 */
$(document).ready(function() {
	$("#alertBar").hide();
	// button click to log in
	$('#ldaplogin').click(function() {
		$.ajax({
			type: "POST",
			url: "/ldaplogin/",
			data: {
				ldapUser: $("#ldapUser").val(),
				ldapPassword: $("#ldapPassword").val()
			},
			async: false,
			success: function(d) {
				if (d == 'success') {
					$.when(submitSpiraTest(), submitJira()).done(function() {
						setTimeout(function() {
							directDBoard()
						}, 3000);
					})
				} else {
					showMsg(d);
					clearText("ldaplogin");
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	});
	// key press 'enter' to log in
	$('#ldapUser').keypress(function(e) {
		var key = e.which;
		if (key == 13) {
			$('#ldaplogin').trigger('click');
		}
	});
	$('#ldapPassword').keypress(function(e) {
		var key = e.which;
		if (key == 13) {
			$('#ldaplogin').trigger('click');
		}
	});
});

function directDBoard() {
	location.href = '/dashboard';
}

function submitSpiraTest() {
	document.forms['spiraTestLoginForm'].action = 'http://140.96.27.65/SpiraTest/Login.aspx?ReturnUrl=%2fSpiraTest%2fMyPage.aspx';
	document.forms['spiraTestLoginForm'].target = 'ifSpira';
	document.forms['spiraTestLoginForm'].elements["mpLogin$cplMainContent$LoginUser$UserName"].value = document.getElementById("ldapUser").value;
	document.forms['spiraTestLoginForm'].elements["mpLogin$cplMainContent$LoginUser$Password"].value = document.getElementById("ldapPassword").value;
	document.forms['spiraTestLoginForm'].submit();
	return true;
}

function submitJira() {
	document.forms['jiraLoginForm'].action = 'http://140.96.27.80:8080/login.jsp';
	document.forms['jiraLoginForm'].target = 'ifJira';
	document.forms['jiraLoginForm'].elements["os_username"].value = document.getElementById("ldapUser").value;
	document.forms['jiraLoginForm'].elements["os_password"].value = document.getElementById("ldapPassword").value;
	document.forms['jiraLoginForm'].submit();
	return true;
}