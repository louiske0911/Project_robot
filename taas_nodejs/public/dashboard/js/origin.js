
function genOriginReport(save, tab, mode, dom, task, strData, objPosition){
	//console.log("save" + save)
	/*console.log("save" + save)
	console.log("tab" + tab)
	console.log("mode" + mode)
	console.log("dom" + dom)
	console.log("task" + task)
	console.log("strData" + strData)
	console.log("objPosition" + objPosition)
	console.log(objPosition)*/
	if(tab == null ) { tab = getCookie("curTab"); save = true; } 
	var arrData = strData.split("<style");
	if(arrData.length > 1){
		strData = "<style" + arrData[1];
	}

	var memoName = dom;
	//var memoName =  brotherDom + mode.capitalizeFirstLetter();

	var tabDiv = "content" + tab;
	if($("#"+tabDiv).children("#"+memoName).text().length >0)
        return false;
	var nowTime = new Date().toLocaleString();
	var objParm = [];
	objParm =  [dom, task];

	createTempltByMode(tabDiv, "messageTable", memoName, draggableDOM, objPosition); // create doms to body of html
	 //if(objPosition == null || objPosition =="")//first time to create chart is no need setting position
	if(save == true){
		 //console.log("save origin")
		savetoDashLayout(tab, task, mode, nowTime, memoName, objPosition, objParm); //save to db
	}

	var domMsgSelector = selectDOMByMode(tabDiv,"messageTable",memoName);
	//console.log(domMsgSelector);
    var divMsgTitle = domMsgSelector.divTitle;
    var divMsg  =  domMsgSelector.divMsg;

     //$( "#" + memoName ).resizable();
     $( "#" + memoName ).addClass("ui-widget-content");
     var titleTxt = "";
     if( mode == "origin")
     	titleTxt = "original";
     else if ( mode == "logMsg")
     	titleTxt = "log";
	divMsgTitle.text(task + " "+ mode +" report");
   	divMsg.html(strData);

																
divMsg.children().children().children().children().children("a.python_html_test_runner_popup_link").click(function(){
	$(this).attr("href","#");
	var openWindows = $(this).siblings('.python_html_test_runner_popup_window').css("display");
	if( openWindows == "none" || openWindows == undefined){

  		$(this).siblings('.python_html_test_runner_popup_window').css("display","block") ;		
	}
  	else{
  		$(this).siblings('.python_html_test_runner_popup_window').css("display","none");	
  	}
})

	    	

}


String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
