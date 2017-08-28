$.getScript("/task/js/testFormMaker.js");

$(document).ready(function() {
	// load the task type which you can choose
	$.ajax({
		type: "POST",
		url: "/getTaskTypes",
		success: function(d) {
			var optionsHTML;
			optionsHTML += "<option value='caption'>Please select a task type</option>";

			var typeList = JSON.parse(d);
			typeList.forEach(function(element) {
				if (isPrefix(element, 'test') || isPrefix(element, 'build') || isPrefix(element, 'deploy')); // Do nothing
				else
					optionsHTML += "<option value='" + element + "'>" + element + "</option>";
			})

			$("#taskType").html(optionsHTML);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});

	// load the form when choose a task type
	$("#taskType").change(function() {
		var taskType = $("#taskType").children(":selected").val();
		if (taskType != 'caption') {
			// show submit button
			$("button#cancelTestTaskBtn").show();
			$("button#finishTestTaskBtn").show();
			// clear fieldset
			$("#taskFieldset").empty();
			// load form
			$.ajax({
				type: "POST",
				data: {
					"taskType": taskType
				},
				url: "/loadAddTaskForm",
				success: function(d) {
					// display form
					var formHTML = '';
					var jobDescript = JSON.parse(d);

					formHTML = formMaker(formHTML, jobDescript);

					$("#taskFieldset").html(formHTML);

					// reload script
					$.getScript("/task/js/check.js");
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
				}
			});
		}
	});

	$.ajax({
		type: "POST",
		data: {
			"taskType": 'build/generic'
		},
		url: "/loadAddTaskForm",
		success: function(d) {
			// display form
			var formHTML = '';
			var jobDescript = JSON.parse(d);

			formHTML = formMaker(formHTML, jobDescript);

			$("#BuildTaskFieldset").html(formHTML);

			// reload script
			$.getScript("/task/js/check.js");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});

	$.ajax({
		type: "POST",
		data: {
			"taskType": 'deploy/generic'
		},
		url: "/loadAddTaskForm",
		success: function(d) {
			// display form
			var formHTML = '';
			var jobDescript = JSON.parse(d);

			formHTML = formMaker(formHTML, jobDescript);

			$("#DeployTaskFieldset").html(formHTML);

			// reload script
			$.getScript("/task/js/check.js");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});

});

/**
 * Check one string is the prefix of another string.
 * @param {String} str1
 * the job's type
 * @param {String} str2
 * the prefix string
 * @returns {Bool} the check result
 * @private
 */
function isPrefix(str1, str2) {
	if (str1.indexOf(str2) === 0)
		return true;
	else
		return false;
}