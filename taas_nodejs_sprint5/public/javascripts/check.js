var EXDAYS = 30;

// load script
$.getScript("/javascripts/cookie.js");

function load() {
	logout.innerHTML = "";
}

function loginPage() {
	location.href = '/login';
}

function signUp() {
	location.href = '/signup';
}

function createTestTask() {
    var projID = $("input[id='projid']").val();
    var edittasks; // permission setting
    $.ajax({
	    type: "POST",
	    url: "/getPermission",
	    data: {
	        projID: projID
	    },
	    success: function(data) {
	        var edittasks = data.edittasks;
	    },
	    async: false,
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
        }
	});
    if(edittasks){
	    location.href = '/createTestTask';
	} else {
	    // access blocked
	    $('.modal-title').text("Permission denied.");
	    $('#createTaskBtn').attr("data-toggle", "modal");
	    $('#createTaskBtn').attr("data-target", "#warningModal");
	}
}

function askAuthority(projID) {
    var editprojectuser; // permission setting
    $.ajax({
	    type: "POST",
	    url: "/getPermission",
	    data: {
	        projID: projID
	    },
	    success: function(data) {
	       editprojectuser = data.editprojectuser;
	    },
	    async: false,
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
        }
	});
    if(editprojectuser) {
        location.href = "/authority/"+projID;
    } else {
        // access blocked
        $('.modal-title').text("Permission denied.");
        $('#modpermis'+projID).attr("data-toggle", "modal");
        $('#modpermis'+projID).attr("data-target", "#warningModal");
    }
}

var emailRegxp = /^([\w]+)(.[\w]+)*@([\w]+)(.[\w]{2,3}){1,2}$/;
var userNamelength = 10;
var passWordlength = 10;
var emailLength = 35;

function check() {
	if (signUpForm.signUpUser.value == "") {
		showMsg("please enter username");
	} else if (signUpForm.signUpUser.value.match(/[\x01-\xFF]*/) == false) {
		showMsg("please enter name in english");
	} else if (signUpForm.signUpUser.value.length > userNamelength) {
		showMsg("name Can not over 10 characters");
	} else if (signUpForm.signUpPassword.value == "") {
		showMsg("please enter password");
	} else if (signUpForm.signUpPassword.value.match(/[\x01-\xFF]*/) == false) {
		showMsg("please enter password in english");
	} else if (signUpForm.signUpPassword.value.length > passWordlength) {
		showMsg("password Can not over 10 characters");
	} else if (signUpForm.signUpPassword.value != signUpForm.signUpConfirmPassword.value) {
		showMsg("password is not same");
	} else if (signUpForm.signUpEmail.value == "") {
		showMsg("please enter email");
	} else if (emailRegxp.test(signUpForm.signUpEmail.value) != true) {
		showMsg("email format error");
	} else if (signUpForm.signUpEmail.value.length > emailLength) {
		showMsg("email Can not over 35 characters");
	} else {
		$("#alertBar").text("");
		return true;
	}
}

function checkProjectedit() {
	$("#projNameDiv").removeClass("form-group has-error");
	$("#projNameDiv").addClass("form-group");

	if ($("#projName").val() == "") {
		$("#projNameDiv").addClass("form-group has-error");
		$("#projName").focus();
		//return false;
	} else {
		return true;
	}
}