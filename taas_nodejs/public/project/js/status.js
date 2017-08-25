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
		var idEditProj = $("#editProj" + id);
		var idDelProj = $("#delProj" + id);
		//alert(id+","+$("#lbl"+id).text());
		$.ajax({
			type: "POST",
			data: {projID: id},
			url: "/statusLightOfProject",
			success: function(d) {
				if (d == 'DONE') {
					//$(me).attr("src", '/images/ready.png');
					idLabel.text("Done");
					idLabel.attr("class", "successfully");
					// Function
					idEditProj.attr("href", "/projectEdit/" + id);
					idEditProj.attr("onclick", "");
					idDelProj.attr("data-toggle", "modal");
					idDelProj.attr("onclick", "askDelProj('" + projName + "','" + id + "')");
				} else if (d == 'RUNNING') {
					//$(me).attr("src", '/images/running.gif');
					idLabel.text("Running");
					idLabel.attr("class", "running");
					// Functional limitations
					idEditProj.attr("href", "");
					idEditProj.attr("onclick", "return false;");
					idDelProj.attr("data-toggle", "");
					idDelProj.attr("onclick", "return false;");
				} else if (d == 'verify error') {
					window.location.assign('/');
				} else {
					alert(d);
					window.location.assign('/');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				//alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
			}
		});
	});
}