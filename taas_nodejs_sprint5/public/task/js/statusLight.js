var DELAY = 5000; // The interval of the polling check

$(document).ready(function() {
	checkStatus();
	setInterval(function() {
		checkStatus();
	}, DELAY);
});

// When a runStopBtn clicked, update the link immediately.
$("a.runStopBtn").click(function() {
	var runStop = $(this);
	if (runStop.html() == "<img class='btnimage' src='/images/Play_Icon.png'/>") { // trigger run
	    if (runtasks){
	        runStop.attr("href", "/stopTask/" + id);
		    runStop.attr("title", "Stop this task");
		    runStop.html("<img class='btnimage' src='/images/stop.png'/>");
	    } else {
	        runStop.attr("href", "");
	        runStop.attr("data-toggle", "modal");
            runStop.attr("data-target", "#warningModal");
	    }
	} else if (runStop.html() == "<img class='btnimage' src='/images/stop.png'/>") { // trigger stop	
		runStop.attr("href", "/runTask/" + id);
		runStop.attr("title", "Run this task");
		runStop.html("<img class='btnimage' src='/images/Play_Icon.png'/>");
	}
});

function checkStatus() {
	var projID = $("input[id='projid']").val();
	$.ajax({
		type: "POST",
		data: {
			projID: projID
		},
		url: "/statusLightOfTasks",
		success: function(d) {
			var jsonResult = JSON.parse(d);
			var statusJson = jsonResult.result;
			var edittasks = jsonResult.edittasks;
			var runtasks = jsonResult.runtasks;
			for (var taskID in statusJson) {
				var statusLight = $("#" + taskID)
				var idLabel = $("#text" + taskID);
				var idrunStop = $("#runStop" + taskID);
				var idEditTask = $("#editTask" + taskID);
				var idDelTask = $("#delTask" + taskID);
				var taskName = statusLight.closest('td').siblings().find(".taskName").text();
				switch (statusJson[taskID]) {
					case 'READY':
						// status light
						statusLight.attr("src", '/images/ready.png');
						idLabel.text("Ready");
						idLabel.attr("class", "ready");
						// run and stop button
						if (runtasks){
						    idrunStop.attr("href", "/runTask/" + taskID);
						} else {
						    idrunStop.attr("href", "");
						    idrunStop.attr("data-toggle", "modal");
						    idrunStop.attr("data-target", "#warningModal");
						}
						idrunStop.attr("title", "Run this task");
						idrunStop.html("<img class='btnimage' src='/images/Play_Icon.png'/>");
						// Function
					    if (edittasks){
						    idEditTask.attr("href", "/editTestTask/" + taskID);
						    idEditTask.attr("onclick", "");
						} else {
						    idEditTask.attr("href", "");
						    idEditTask.attr("data-toggle", "modal");
						    idEditTask.attr("data-target", "#warningModal");
						}
						idDelTask.attr("data-toggle", "modal");
						idDelTask.attr("onclick", "askDelTask('" + taskName + "','" + taskID + "'," + edittasks + ")");
						break;
					case 'SUCCESS':
						// status light
						statusLight.attr("src", '/images/green.png');
						idLabel.text("Success");
						idLabel.attr("class", "successfully");
						// run and stop button
						if (runtasks){
						    idrunStop.attr("href", "/runTask/" + taskID);
						} else {
						    idrunStop.attr("href", "");
						    idrunStop.attr("data-toggle", "modal");
						    idrunStop.attr("data-target", "#warningModal");
						}
						idrunStop.attr("title", "Run this task");
                        idrunStop.html("<img class='btnimage' src='/images/Play_Icon.png'/>");
						// Function					
						if (edittasks){
						    idEditTask.attr("href", "/editTestTask/" + taskID);
						    idEditTask.attr("onclick", "");
						} else {
						    idEditTask.attr("href", "");
						    idEditTask.attr("data-toggle", "modal");
						    idEditTask.attr("data-target", "#warningModal");
						}
						idDelTask.attr("data-toggle", "modal");
						idDelTask.attr("onclick", "askDelTask('" + taskName + "','" + taskID + "'," + edittasks + ")");
						break;
					case 'FAILURE':
					case 'ABORTED':
					case 'UNSTABLE':
						// status light
						statusLight.attr("src", '/images/red.png');
						idLabel.text("Failed");
						idLabel.attr("class", "failed");
						// run and stop button
						if (runtasks){
						    idrunStop.attr("href", "/runTask/" + taskID);
						} else {
						    idrunStop.attr("href", "");
						    idrunStop.attr("data-toggle", "modal");
						    idrunStop.attr("data-target", "#warningModal");
						}
						idrunStop.attr("title", "Run this task");
						idrunStop.html("<img class='btnimage' src='/images/Play_Icon.png'/>");
						// Function					
						if (edittasks){
						    idEditTask.attr("href", "/editTestTask/" + taskID);
						    idEditTask.attr("onclick", "");
						} else {
						    idEditTask.attr("href", "");
						    idEditTask.attr("data-toggle", "modal");
						    idEditTask.attr("data-target", "#warningModal");
						}
						idDelTask.attr("data-toggle", "modal");
						idDelTask.attr("onclick", "askDelTask('" + taskName + "','" + taskID + "'," + edittasks + ")");
						break;
					default:
						// status light
						statusLight.attr("src", '/images/running.gif');
						idLabel.text("Running");
						idLabel.attr("class", "running");
						// run and stop button
						idrunStop.attr("href", "/stopTask/" + taskID);
						idrunStop.attr("title", "Stop this task");
						idrunStop.html("<img class='btnimage' src='/images/stop.png'/>");
						// Functional limitations
						idEditTask.attr("href", "");
						idEditTask.attr("onclick", "return false;"); // not reload
						idDelTask.attr("data-toggle", "");
						idDelTask.attr("onclick", "return false;"); // not reload
				}
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
}