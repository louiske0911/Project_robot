$(function () {
	$('#displayElem').html('1'); // This line is not required (I just up the system and say there is 1 tab in the <div id="messagesAlert"></div> markup)
 
	$('#myTab a[href="#addTab"]').on('click', function () { // Click event on the "Add Tab" button
		var nbrLiElem = ($('ul#myTab li').length) - 1; // Count how many <li> there are (minus 1 because one <li> is the "Add Tab" button)
		
		// Add a <li></li> line before the last-child
		// Including the complete structure: the li ID, the <a href=""></a> etc... check the Bootstrap togglable tabs structure
		$('ul#myTab li:last-child').before('<li id="li' + (nbrLiElem + 1) + '"><a href="#tab' + (nbrLiElem + 1) + '" role="tab" data-toggle="tab">Tab ' + (nbrLiElem + 1) + ' <button type="button" class="btn btn-warning btn-xs" onclick="removeTab(' + (nbrLiElem + 1) + ');"><span class="glyphicon glyphicon-remove"></span></button></a>');
		
		// Add a <div></div> markup after the last-child of the <div class="tab-content">
		$('div.tab-content div:last-child').after('<div class="tab-pane fade" id="tab' + (nbrLiElem + 1) + '"><p>Content tab ' + (nbrLiElem + 1) + '</p></div>');
		nbrLiElem = nbrLiElem + 1; // 1 more element in the tab system
		$('#displayElem').html(nbrLiElem); // This line is not required (I just display, inside the <div id="messagesAlert"></div> markup, how many tabs there is)
	});
});
 
function removeTab(liElem) { // Function remove tab with the <li> number
	if (confirm("Are you sure?")) { // Display "Are you sure message" and wait for you to press "Ok"
		$('ul#myTab > li#li' + liElem).fadeOut(1000, function () { 
			$(this).remove(); // Remove the <li></li> with a fadeout effect
			$('#messagesAlert').text(''); // Empty the <div id="messagesAlert"></div>
		});
		
		$('div.tab-content div#tab' + liElem).remove(); // Also remove the correct <div> inside <div class="tab-content">
		
		$('ul#myTab > li').not('#last').not('#li' + liElem).each(function(i){ // Select all <li> from <ul id="myTab"> except the last (with is the "Add Tab" button) and without the one we deleted
			var getAttr = $(this).attr('id').split('li'); // We get the <li> div attribute
			$('ul#myTab li#li' + getAttr[1]).attr('id', 'li' + (i + 1)); // We change the div attribute of all <li>: the first is 1, then 2, then 3...
			
			var tabContent = 'Tab ' + (i + 1); // 
			if (getAttr[1] != 1) tabContent += ' <button type="button" class="btn btn-warning btn-xs" onclick="removeTab(' + (i + 1) + ');"><span class="glyphicon glyphicon-remove"></span></button>';
			$('#myTab a[href="#tab' + getAttr[1] + '"]').html(tabContent) // tabContent variable, inside the <li>. We change the number also, 1, then 2, then3...
														.attr('href', '#tab' + (i + 1)); // Same for the href attribute
			
			$('div.tab-content div#tab' + getAttr[1]).html('<p>Content tab ' + (i + 1) + '</p>') // We do the same for all <div> from <div class="tab-content">: we change the number: 1, then 2, then 3...
													.attr('id', 'tab' + (i + 1)); // Same for the id attribute
													
			$('#displayElem').html(i+1); // This line is not required (I just display, inside the <div id="messagesAlert"></div> markup, how many tabs there is)
		});
		
		$('#messagesAlert').html('<div class="alert alert-danger" id="alertFadeOut">This tab has been deleted!</div>'); // Message saying that the tab has been deleted
	}
	return false;
}