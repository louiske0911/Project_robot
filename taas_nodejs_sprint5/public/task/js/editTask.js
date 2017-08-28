$(document).ready(function() {
	$("form#teskForm").submit(function(e) {
		e.preventDefault(); // avoid to execute the actual submit of the form.
		if(boolCheckAll()){
			$.ajax({
				type: "POST",
				url: "/updateTestTask",
				data: {
					projID: $("#projID").val(),
					taskID: $("#taskID").val(),
					jobType: $("#jobType").val(),
					testForm: $("#teskForm").serialize() // serializes the form's elements
				},
				success: function(data) {
					if(data == 'success')
						location.href = '/tasklistByProjID/' + $("#projID").val();
					else if(data == 'repeat name')
						$("#alertBar").text('The task name is repeat. Please choose another one.');
					else
						$("#alertBar").text(data);
				}
			});
		}
	});
});