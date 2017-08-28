var edittasks, runtasks; // permission settings

$(document).ready(function() {
	/*$.ajax({
		type: "POST",
		url: "/getTasksOrder",
		data: {
			projID: $("input#projid").val()
		},
		success: function(data) {
			var tasksOrder = JSON.parse(data);
			$(".level").each(function() {
				var taskName = $(this).closest('td').siblings().find(".taskName").text();
				$(this).text(tasksOrder[taskName]);
			});			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});*/
	// 2017.8.23 Tony
	var projID = $("input[id='projid']").val();
	$.ajax({
	    type: "POST",
	    url: "/getPermission",
	    data: {
	        projID: projID
	    },
	    success: function(data) {
	        edittasks = data.edittasks;
	        runtasks = data.runtasks;
	    },
	    async: false,
	    error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
        }
	});
});

function upLevel(taskID) {
	if (edittasks) {
        $.ajax({
            type: "POST",
            url: "/upOrderTask",
            data: {
                taskID: taskID
            },
            success: function(data) {
                window.location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
            }
        });
	    return false;
	} else {
	    // access blocked
	    let idUpLv = $("#upLvBtn"+taskID);
	    idUpLv.attr("data-toggle", "modal");
	    idUpLv.attr("data-target", "#warningModal");
	}
};

function downLevel(taskID) {
    if (edittasks) {
        $.ajax({
            type: "POST",
            url: "/downOrderTask",
            data: {
                taskID: taskID
            },
            success: function(data) {
                window.location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
            }
        });
        return false;
	} else {
	    // access blocked
	    let idDownLv = $("#downLvBtn"+taskID);
	    idDownLv.attr("data-toggle", "modal");
	    idDownLv.attr("data-target", "#warningModal");
	}
};

function enableContDownstream(taskID, enable) {
	if (edittasks) {
        console.log('enableContDownstream: ' + enable);
        $.ajax({
            type: "POST",
            url: "/contDownstreamTask",
            data: {
                taskID: taskID,
                enable: enable? 'true': 'false'
            },
            success: function(data) {
                window.location.reload();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
            }
        });
        return false;
	} else {
	    // access blocked
	    let idCDS = $("#contDownstream"+taskID);
	    idCDS.attr("data-toggle", "modal");
	    idCDS.attr("data-target", "#warningModal");
	}
}

function triggerSleep(taskID, taskLv) {
	if (edittasks) {
        if (taskLv == 0) {
            // wake up
            $.ajax({
                type: "POST",
                url: "/wakeTask",
                data: {
                    taskID: taskID
                },
                success: function(data) {
                    window.location.reload();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
                }
            });
        } else {
            // sleep
            $.ajax({
                type: "POST",
                url: "/sleepTask",
                data: {
                    taskID: taskID
                },
                success: function(data) {
                    window.location.reload();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
                }
            });
        }
        return false;
	} else {
	    // access blocked
	    let idTS = $("#triggerSleep"+taskID);
	    idTS.attr("data-toggle", "modal");
	    idTS.attr("data-target", "#warningModal");
	}
}
