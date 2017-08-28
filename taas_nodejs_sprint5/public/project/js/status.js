$(document).ready(function() {
	update(); // first update
	var statud = setInterval(function() { // polling update
		update()
	}, 3000);
});

function update() {
	$(".statusLight").each(function() {
		var me = this;
		var id = $(this).attr("id");
		var projName = $(this).closest('td').siblings().find(".projName").text();
		var idLabel = $("#text" + id);
		var idCopyProj = $("#copyProj" + id);
		var idEditProj = $("#editProj" + id);
		var idDelProj = $("#delProj" + id);
		//alert(id+","+$("#lbl"+id).text());
		$.ajax({
			type: "POST",
			data: {projID: id},
			url: "/statusLightOfProject",
			success: function(d) {
			    var jsonResult = JSON.parse(d);
                var statusJson = jsonResult.result;
                var editprojectuser = jsonResult.editprojectuser;
				if (statusJson == 'DONE') {
					//$(me).attr("src", '/images/ready.png');
					idLabel.text("Done");
					idLabel.attr("class", "successfully");
					// Function
					idCopyProj.attr("data-toggle", "modal");
					idCopyProj.attr("onclick", "askCopyProj('" + projName + "', '" + id + "', " + editprojectuser + ")");
					if(editprojectuser){
                        idEditProj.attr("href", "/projectEdit/" + id);
                        idEditProj.attr("onclick", "");
					} else {
					    $('.modal-title').text("Permission denied.");
					    idEditProj.attr("href", "");
					    idEditProj.attr("data-toggle", "modal");
					    idEditProj.attr("data-target", "#warningModal");
					}
					idDelProj.attr("data-toggle", "modal");
					idDelProj.attr("onclick", "askDelProj('" + projName + "', '" + id + "', " + editprojectuser + ")");
				} else if (statusJson == 'RUNNING') {
					//$(me).attr("src", '/images/running.gif');
					idLabel.text("Running");
					idLabel.attr("class", "running");
					// Functional limitations
					idEditProj.attr("href", "");
					idEditProj.attr("onclick", "return false;");
					idDelProj.attr("data-toggle", "");
					idDelProj.attr("onclick", "return false;");
					idCopyProj.attr("data-toggle", "modal");
					idCopyProj.attr("onclick", "askCopyProj('" + projName + "', '" + id + "', " + editprojectuser + ")");
				} else if (statusJson == 'verify error') {
					window.location.assign('/');
				} else {
					alert(statusJson);
					window.location.assign('/');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				//alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	});
}