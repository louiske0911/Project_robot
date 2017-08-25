// initialize all feature of console log
function initializeLog(){
	initializeFolder();
}

// transform consecutive fold items into a fold block
function initializeFolder(){
	var lastFoldItem, foldItems;
	while($('.FoldItem').length){
		// fold item means the line needed to be folded
		foldItems = $('.FoldItem');
		var foldItemCount = 0;
		lastFoldItem = foldItems[foldItems.length-1];
		// trace the fold items upward and count the ammount of fold items
		var foldbutton = document.createElement('div');
		foldbutton.className = 'foldbutton';
		if($(lastFoldItem).hasClass('Err')){
			foldbutton.className += ' Err';
		}
		while($(lastFoldItem).hasClass('FoldItem')){
			var temp = lastFoldItem;
			lastFoldItem = $(lastFoldItem).parent().prev().children()[0];
			$(temp).parent().css('display', 'none');
			$(temp).remove();
			foldItemCount++;
		}
		var folderContainer = $(lastFoldItem);
		folderContainer.attr('rowspan', '1');
		folderContainer.css('vertical-align', 'top');
		folderContainer.data('childAmount', foldItemCount);
		// foldbutton is a button allows user to fold and unfold specific message
		$(foldbutton).click(function(){
			if($(this).hasClass('unfolded')){
				$(this).removeClass('unfolded');
				$(this).parent().attr('rowspan', '1');
				var startRow = $(this).parent().parent().next();
				var childAmount = parseInt($(this).parent().data('childAmount'));
				// find the fold items downward and fold them
				for(var i = 0;i < childAmount;i++){
					startRow.css('display', 'none');
					startRow = startRow.next();
				}
			}else{
				$(this).addClass('unfolded');
				$(this).parent().attr('rowspan', '2');
				var startRow = $(this).parent().parent().next();
				var childAmount = parseInt($(this).parent().data('childAmount'));
				// find the fold items downward and unfold them
				for(var i = 0;i < childAmount;i++){
					startRow.css('display', 'block');
					startRow = startRow.next();
				}
			}
		});
		folderContainer.append(foldbutton);
	}
}
