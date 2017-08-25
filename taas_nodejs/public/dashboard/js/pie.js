
/*
* @dataPie: flot data 
*/	
var dataPie = function(jsonSeries){
	var dataSet = [];
    return dataSet;
}
/*
* @optionsPie: flot option
*/	
var optionsPie = {
	series: {
		pie: {
	    	show: true,

	    	label: {
    	     show: true,
           radius: 0.5,
           formatter : labelFormatter

	    	}
		}
	},
	grid: {
	    hoverable: true,
	    clickable: true
	}
};


function labelFormatter(label, series) {

  var percent = Math.round(series.percent*10)/10;
  return  label + "<br/>" + percent+ "%";
    //return "<div style='font-size:8pt; text-align:center; padding:2px; color:black;'>"    + label.replace("numTest","") + "<br/>" + series.data[0][1] + "%</div>";
}

function filterStr(strFilter,objList){

  for(var i in objList){
    objList[i] = objList[i].replace(strFilter,"");
    
  }
  return objList;

}

/*
* @showMemo: flot tooltip 
*/
$.fn.showMemo = function (memoDiv) {
    $(this).bind("plothover", function (event, pos, item) {
        if (!item) { return; }
        var html = [];
        var percent = Math.round(parseFloat(item.series.percent)*10)/10;
      
        html.push("<div style=\"border:1px solid grey;background-color:",
             item.series.color,
             "\">",
             "<span style=\"color:white\">",
             item.series.label,
             " : ",
             $.formatNumber(item.series.data[0][1], { format: "#,###", locale: "us" }),
             " (", percent, "%)",
             "</span>", 
             "</div>");
        memoDiv.html(html.join(''));
    });
}
/*
function combine_taskName_dateTime(taskName,creatDate,createTime){
	creatDate = creatDate.replace(/\//g,"_");
	createTime = createTime.replace(/:/g,"_");
	return taskName+"_"+creatDate+"_"+createTime;
}*/

/*
* @drawPieFlot: draw Pie chart
* "memo_border_"+memoName = dom id 
* if exited then not to draw
*/
function drawPieFlot(save, tab, jsonSeries, taskName, creatDate, createTime, objPosition){


    if(tab == null ) {   tab = getCookie("curTab"); save = true; } 
   
    var objParm = [];
//require line.js
//=================================create DOMs
	var tabDiv = "content" + tab;
    var memoName = getMemoName(taskName, creatDate, createTime, "pie"); 
    var nowTime = new Date().toLocaleString();
    if($("#"+tabDiv).children("#"+memoName).text().length >0)
        return false;

  
    if( !hasMemoDOM(tabDiv,memoName) ){
        
        objParm =  [JSON.stringify(jsonSeries),taskName,creatDate, createTime];
      //  if(objPosition == null || objPosition ==""){//first time to create chart is no need setting position
       /* console.log(taskName)
        console.log(nowTime)
        console.log(taskName)
        console.log(memoName)
        console.log(objPosition)
        console.log(objParm)*/
        if(save == true){
            savetoDashLayout(tab, taskName, "pie", nowTime, memoName, objPosition,objParm); //save to db
        }
       // }
        createTempltByMode(tabDiv,"pieChart", memoName, draggableDOM, objPosition); 

        var domMsgSelector = selectDOMByMode(tabDiv,"pieChart", memoName);

        var divMsgTitle = domMsgSelector.divTitle;
        var divPie  =  domMsgSelector.divPie;
        var divTip  =  domMsgSelector.divTip;
        var divDateTime  =  domMsgSelector.divDateTime;
        //=====draggable===================
        //draggableDOM(memoName);
        divMsgTitle.html(taskName);
        divDateTime.html(creatDate+" "+ createTime);
        $.plot(divPie, jsonSeries, optionsPie);
        divPie.showMemo(divTip);


    }
	
}	








