// load javascript
$.getScript("/task/js/testFormMaker.js");

$(document).ready(function() {
	var taskType = $("#jobType").val();
	// load the form
	var descType = {};
	$.ajax({
		type: "POST",
		data: {
			"taskID": $("input#taskID").val()
		},
		url: "/loadEditTaskForm",
		success: function(d) {
			// display form
			var formHTML = '';
			var jobDescript = JSON.parse(d);

			if (isPrefix(taskType, 'scm/git'))
				formHTML = formInputDiv('uneditableTaskName', 'Git');
			else if (isPrefix(taskType, 'scm/svn'))
				formHTML = formInputDiv('uneditableTaskName', 'Svn');
			else if (isPrefix(taskType, 'build'))
				formHTML = formInputDiv('uneditableTaskName', 'Build');
			else if (isPrefix(taskType, 'deploy'))
				formHTML = formInputDiv('uneditableTaskName', 'Deploy');	
			else
				formHTML = formInputDiv('taskName');

			formHTML = formMaker(formHTML, jobDescript);

			$("#taskFieldset").html(formHTML);

			if(isPrefix(taskType,'test')){
				$('#Upload_report_data_to_SpiraTest').change(uploadSpiraTestChange);
				$('#Upload_report_data_to_TestLink').change(uploadTestLinkChange);
			}
			// get the type of every element
			jobDescript.forEach(function(element) {
				if(element.type == DESCRIPTOR_TYPE.PARENTDIV){
					element.childs.forEach(function(element) {
						descType[element.name] = element.type;
					});
				}else{
					descType[element.name] = element.type;
				}
			});

			// reload script
			$.getScript("/task/js/check.js");

			// load the task information
			$.ajax({
				type: "POST",
				data: {
					"taskID": $("input#taskID").val()
				},
				url: "/getTaskInfo",
				success: function(d) {
					var task = JSON.parse(d);
					// task name
					$("[id='taskName']").val(task.testtaskname);
					// task descriptors
					var testscript = task.testscript;
					for (var key in testscript) {
						var val = testscript[key];
						var type = descType[key];
						switch (type) {
							case DESCRIPTOR_TYPE.NUMBER:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.DECIMAL:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.STRING:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.PASSWORD:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.OPTION:
								if (typeof val === 'object') { // multiple answer
									val.forEach(function(e) {
										$("input[class='" + key + "'][value='" + e + "']").prop('checked', true);
									});
								} else { // single answer
									$("select[id='" + key + "'] option[value='" + val + "']").prop("selected", true);
								}
								break;
							case DESCRIPTOR_TYPE.URL:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.PATH:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.EMAIL:
								$("[id=" + key + "]").val(val);
								break;
							case DESCRIPTOR_TYPE.PARENTDIV:
								break;
							default: // other
								; // do nothing
						}
					}
					selectChildSetting();
					setSelectChildsValue(testscript);
					if(isPrefix(taskType,'test')){
						uploadTestLinkChange.call($('#Upload_report_data_to_TestLink')[0]);
						uploadSpiraTestChange.call($('#Upload_report_data_to_SpiraTest')[0]);
						setInitialDisabledOrNot();
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
				}
			});
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
