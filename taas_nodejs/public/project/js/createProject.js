// load script
$.getScript("/javascripts/cookie.js");

function checkProject() {
	if ($("#projName").val() == "") {
		$("#projNameDiv").addClass("form-group has-error");
		$("#projName").focus();
		//return false;
	} else {
		return true;
	}
}

$(document).ready(function(){
	$("#projectSubmit").click(function() {
		if (boolCheckAll() && checkProject())
			submitProject();
	});
	var fieldsetIDs = ["#BuildTaskFieldset", "#DeployTaskFieldset", "#CopyTaskFieldset"];
	$(".dbproj").each(function(index, checkbox){
		$(checkbox).change(function(){
			if(this.checked){
				$(fieldsetIDs[index]).css("display", "block");
			}else{
				$(fieldsetIDs[index]).css("display", "none");
			}
		});
	});
});

function submitProject() {
	var fieldcheckboxes = document.querySelectorAll('input[class="dbproj"]'),
		fieldcheckboxvalue = [];
	Array.prototype.forEach.call(fieldcheckboxes, function(el) {
		if(el.checked){
			fieldcheckboxvalue.push(el.value);
		}else{
			fieldcheckboxvalue.push(null);
		}
	});
	var taskcheckboxes = document.querySelectorAll('input[name="projecttasklist"]:checked'),
		taskids = [];

	Array.prototype.forEach.call(taskcheckboxes, function(el) {
		taskids.push(el.value);
	});
	$.ajax({
		type: "POST",
		url: "/buildnewproject",
		data: {
			projDesc: $("#projDesc").val(),
			projname: $("#projName").val(),
			Buildproj: fieldcheckboxvalue[0],
			Deployproj: fieldcheckboxvalue[1],
			CopyTask: fieldcheckboxvalue[2],
			projSvm: $("#taskType").find(":selected").val(),
			projUrl: $("#repoURL").val(),
			projBranch: $("#repoBranch").val(),
			projUsername: $("#username").val(),
			projPassword: $("#password").val(),
			projSsh: $("#privateKey").val(),
			BuildPlugin: $("#buildScript").val(),
			DeployCfg: $("#deployCfg").val(),
			Scmval: $("#taskFieldset").serialize(),
			Buildval: $("#BuildTaskFieldset").serialize(),
			Deployval:$("#DeployTaskFieldset").serialize(),
			taskid: taskids
		},
		async: false,
		success: function(d) {
			if (d == 'Error: Project name repeats') {
				$("#alertBar").text('This name is used by another project.');
			} else {
				location.href = '/projectlist';
			}
		},
		error: function() {
			alert("error");
		}
	});
}