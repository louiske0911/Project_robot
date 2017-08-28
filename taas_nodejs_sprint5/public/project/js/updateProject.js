$(document).ready(function() {
	$("#projectEditSubmit").click(function() {
		if (checkProjectedit()){
			//$.getScript("/javascripts/check.js");
			updateProject();
		}
	});
});

function updateProject() {
	$.ajax({
		type: "POST",
		url: "/fProjEdit/" + $("#projID").val(),
		data: {
			projName: $("#projName").val(),
			projDesc: $("#projDesc").val(),

		},
		async: false,
		success: function(d) {
			if (d == 'success') {
				$("#projectForm").attr("action", "/projectList");
				$("#projectForm").submit();
			} else if (d == 'same') {
				alert("projname is same");
				$("#projectForm").attr("action", "/projectedit/" + $("#projID").val());
				$("#projectForm").submit();
			}
		},
		error: function() {
			alert("error");
		}
	});
}