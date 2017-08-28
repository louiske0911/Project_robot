$(document).ready(function() {
	$("#ldapUser").focus();
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		var target = $(e.target).attr('data-focus'); 
		$(target).focus();
	});
});