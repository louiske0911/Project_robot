/**
 *  create or hide a form which is used for uploading report to spiratest
 */

function uploadSpiraTestChange(){
	if(this.checked){
		$("#spiraTestForm").css("display","block");
		$("#spiraTestForm").children().each(function(index,value){
			$(value).removeClass('inactive');
		});
	}else{
		$("#spiraTestForm").css("display","none");
		$("#spiraTestForm").children().each(function(index,value){
			$(value).addClass('inactive');
		});
	}
}
function uploadTestLinkChange(){
	if(this.checked){
		$("#TestLinkForm").css("display","block");
		$("#TestLinkForm").children().each(function(index,value){
			$(value).removeClass('inactive');
		});
	}else{
		$("#TestLinkForm").css("display","none");
		$("#TestLinkForm").children().each(function(index,value){
			$(value).addClass('inactive');
		});
	}
}