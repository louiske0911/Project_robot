
function saveSetting(projID) {
    const checkboxStatusTrue = 1;
    const checkboxStatusFalse = 0;

    let a=0;
    let arrayCheck=[];
    let arrayName =[];


    $(".emailShare").each(function(){    //Get the EmailName of table in front-end .
	    arrayName.push($(this).text());
	});
    $("th>input").each(function(){    //Get the status of checkboxs in front-end .

	    if($(this).prop("checked")) a=checkboxStatusTrue;    //1 is true .
	    else a=checkboxStatusFalse;                           //0 is false
	    arrayCheck.push(a);

	});

    $.ajax({
		type: "POST",
		url: "/editauthority/" + projID,
		data: {
		    projID:projID,
            shareEmail: arrayName,
            shareUserAuthod: arrayCheck
		},
		async: false,
		success: function(d) {
		    alert(d);
			if (d == 'success') {
				alert('success');
                window.location.reload();
			} else if (d == 'The data is null .') {
			    alert('The data is null .');

				window.location.reload();
			} else {
			    alert('in default');

				alert(d);
				window.location.assign('/');
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
		    alert('error');
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
		}
	});
}