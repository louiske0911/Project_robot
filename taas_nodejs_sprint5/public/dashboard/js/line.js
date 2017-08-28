/*
*clear text when change tab
*@parm {string} DOM
*
*
*
*/
/*
function clearDivSwitchTab(div,parent){
	if(parent == "" || parent == null)
		$("#" + div).text("");
	else
  		$(parent +?£á"#" + div).text("");
}*/
function clearDivSwitchTab(div){
    if(div!=null)
		div.text("");
	
}

/*
*@getDateTimebytimeStamp : formate timestamp to YYYY/MM/dd hh:mm:ss
*
*
**/
function getDateTimebytimeStamp(timeStamp){
 	var date = new Date(timeStamp);
  	var formatDate =  date.getFullYear() + "/" + (date.getMonth() + 1) + '/' + date.getDate() ;
   //formatDate += " " +date.getHours() + ":" +  ": 0" + date.getMinutes();+" : 0" + date.getSeconds();
	var hours = date.getHours();
// Minutes part from the timestamp
	var minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
	var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format
	var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

	return formatDate +" " +formattedTime
}
//var objData = new Array();
//objData = [{"fieldName":["html","python","python2","test2browser"],"series":[{"z":"html","x":1458538297372,"y":41250},{"z":"html","x":1458537869213,"y":32159},{"z":"html","x":1458266902445,"y":33725},{"z":"python2","x":1458537901419,"y":55877},{"z":"python2","x":1458267004087,"y":72324},{"z":"test2browser","x":1458537957347,"y":76309},{"z":"test2browser","x":1458537562342,"y":61892},{"z":"test2browser","x":1458532882168,"y":62898},{"z":"python","x":1458537807352,"y":61791},{"z":"python","x":1458266936223,"y":67816}],"successFail":[1,0,1,1,1,1,1,1,1,1]}];
//var jsonData = JSON.parse(objData );
//console.log(Object.keys(objData ));
//var objRunTime = objData.pop();
//console.log(objRunTime);
/*
*@.fn.UseTooltip : show tooltip on line chart
* show message "taskName, duration, timestamp success or fail"
*
*
**/
$.fn.UseTooltip = function () {
    var previousPoint = null;

    $(this).bind("plothover", function (event, pos, item) {     

        if (item) {
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;

                $("#tooltip").remove();
                //console.log(item);
                var x = item.datapoint[0]; //time
                var y = item.datapoint[1]; //duration               
                showTooltip(item.pageX, item.pageY,
                 item.series.label + " task <br /><strong>" + y + " sec</strong> (" + getDateTimebytimeStamp(x) + ")"+ "<br/>"+ item.series.successFail[item.dataIndex]);
            }
        }
        else {
            $("#tooltip").remove();
            previousPoint = null;
        }
    });
};
/*
*@showTooltip : show tooltip style
*
*
**/
function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css({
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 20,
        border: '2px solid #4572A7',
        padding: '2px',     
        size: '10',   
        'background-color': '#fff',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);
}
/*
*@formatDatafrom_RunStatusHistory : for flot chart format date to json  
*@parm:jsonSeries :
*   [{
*       "project" : projectName,	
*		"fieldName":["taskName1","taskName2"],
*        "series":[{"z":"taskName1","x":timestamp,"y":duration},
*                     {"z":"taskName1","x":timestamp,"y":duration},
*                     {"z":"taskName1","x":timestamp,"y":duration},
*                     {"z":"taskName2","x":timestamp,"y":duration},
*                     {"z":"taskName2","x":timestamp,"y":duration}],
*        "successFail":[1,1,0,1,1] 
*    }]
* 1: success, 0:fail
*=====================================================================
* return : JSON
*
* {
*  "taskName":{"label":"taskName",
*  		       "data":[[timestamp,duration(sec)],[timestamp,duration(sec)],[timestamp,duration(sec)]],
*  		       "successFail":["success","fail","success"]},
*  "python":{"label":"python",
*  			 "data":[[1458537807352,61.79],[1458266936223,67.82]],
*  			 "successFail":["success","success"]},
*   "python2":{"label":"python2",
*   		   "data":[[1458537901419,55.88],[1458267004087,72.32]],
*   		   "successFail":["success","success"]
*   		  }
*  }
*
*
*****************/
function formatDatafrom_RunStatusHistory(jsonSeries){


   // fieldName,series,successFail
var firstloop= 0 ; 
var seriesInt = 0;
var announceFailTxt = "";
var takLabData = [], takSuFail = [];
var datasets = "{";
//console.log(jsonSeries["series"]);
maxTime = 0;minTime = 0; //initial clear comapre item

for(var zxyInt = 0; zxyInt < jsonSeries["series"].length; zxyInt++){
	var taskNameZ = jsonSeries["series"][zxyInt]["z"];
	if(takLabData[taskNameZ ] == null){  takLabData[taskNameZ ] = []; takSuFail[taskNameZ ] = [];}
	var duration =  Math.round(parseInt(jsonSeries["series"][zxyInt]["y"])/1000*100)/100;
	var startTaskTime = parseInt(jsonSeries["series"][zxyInt]["x"]);
	var x_y  = [];
	x_y.push(startTaskTime ,  duration);
	takLabData[taskNameZ].push(x_y);
	var dateTime =  getDateTimebytimeStamp(startTaskTime);
	compareMaxTime(startTaskTime);
	compareMinTime(startTaskTime);

	var successFail = jsonSeries["successFail"][zxyInt] == 0 ? "fail" : "success";
	if(successFail == "fail"){announceFailTxt+= taskNameZ + " task fail at " + dateTime  +"</br>";}
	takSuFail[taskNameZ].push(successFail );
}
var intFeildTask = 0;
for(var intFeild in jsonSeries["fieldName"]){
    //skip those task
    if(jsonSeries["fieldName"][intFeild] == "Git" || jsonSeries["fieldName"][intFeild] == "Deploy" || 
       jsonSeries["fieldName"][intFeild] == "Build")
        continue;
	if(intFeildTask != 0) datasets  += ',';
		var taskName = jsonSeries["fieldName"][intFeild];

	datasets  += '\"' + taskName +'\":{"label":\"' + taskName+'\","data":'+ JSON.stringify(takLabData[taskName]);
	datasets  += ',"successFail":'+ JSON.stringify(takSuFail[taskName])
	+"}"; 
    intFeildTask++;
}
datasets += "}";

 var datasetJson = jQuery.parseJSON(datasets);
return {datasetJson: datasetJson,announceFailTxt:announceFailTxt,title:jsonSeries["project"]};
//return jQuery.parseJSON(datasets);


}

/*
*fail task message
*
*/
function drawFailMessage(tab, project,announceFailTxt,memoName,objPosition, autoReflesh){//drawLineFlot
    var tabDiv = "content" + tab;
    if($("#"+tabDiv).children("#"+memoName).text().length >0 && autoReflesh != true)
        return false;
    var nowTime = new Date().toLocaleString();
    var objParm = [];

    objParm =  [project,announceFailTxt, memoName];
    //=================================fail massage
    createTempltByMode(tabDiv,"messageTable",memoName,draggableDOM, objPosition); 
    if(objPosition == null || objPosition =="" || autoReflesh == true)//first time to create chart is no need setting position
      savetoDashLayout(tab, null, "message", nowTime, memoName, objPosition, objParm); //save to db

    var domMsgSelector = selectDOMByMode(tabDiv,"messageTable", memoName);//summary_msg
    var divMsgTitle = domMsgSelector.divTitle;
    var divMsg  =  domMsgSelector.divMsg;

    divMsgTitle.text("fail message");
    if(announceFailTxt == null || announceFailTxt==""){
        announceFailTxt = "message: no fail task."
    }
    divMsg.html(announceFailTxt);

}

/*
* draw line chart
* @parm {String} tab name
* @parm {json} for chart data
* @parm {String} memo dom name of id
* @parm {Function} drag function
* @param {array} css
* 
*/
function drawLineFlot(tab, project, jsonSeries, memoName, objPosition, autoReflesh, showFailOnly){//drawLineFlot
    if(tab == null ) { tab = getCookie("curTab");} 
    var tabDiv = "content" + tab;
    var nowTime = new Date().toLocaleString();
    var objParm = [];
    // get fail messages
   var getRunStatusHistory = formatDatafrom_RunStatusHistory(jsonSeries);
   var datasets = getRunStatusHistory.datasetJson;
   var announceFailTxt = getRunStatusHistory.announceFailTxt;
   var title = getRunStatusHistory.title;
//create fail task message
  if(showFailOnly == true)
    return drawFailMessage(tab, project, announceFailTxt, memoName+"_msg", objPosition, true);

  if(objPosition == null || objPosition == "") //(for first time)if has objPosition then meaing message will create by itself.
    drawFailMessage(tab, project, announceFailTxt, memoName+"_msg", null);

    //avoid redisplay this memo
  if($("#"+tabDiv).children("#"+memoName).text().length >0 && autoReflesh != true)
        return false;
  objParm =  [project, JSON.stringify(jsonSeries), memoName];
  createTempltByMode(tabDiv, "lineChart", memoName, draggableDOM, objPosition); // create doms to body of html
  if((objPosition == null || objPosition =="" || autoReflesh == true) && showFailOnly != true)//first time to create chart is no need setting position
      savetoDashLayout(tab, null, "line", nowTime, memoName, objPosition,objParm); //save to db

    var domSelector = selectDOMByMode(tabDiv,"lineChart",memoName);
    var divTitle = domSelector.divTitle;
    var divLine  = domSelector.divLine;
    var divChoices  = domSelector.divChoices;
    var divlegend =  domSelector.divlegend;



   divTitle.html(title);

   

    var i = 0;
    $.each(datasets, function(key, val) {
        val.color = i;
        ++i;
    });
    
    // insert checkboxes 
    var choiceContainer = divChoices;
    $.each(datasets, function(key, val) {
        choiceContainer.append('<br/><input type="checkbox" name="' + key +
                               '" checked="checked" id="id' + key + '">' +
                               '<label for="id' + key + '">'
                                + val.label + '</label>');
    });

    choiceContainer.find("input").click(plotAccordingToChoices);

    
    function plotAccordingToChoices() {
        var data = [];

        choiceContainer.find("input:checked").each(function () {
            var key = $(this).attr("name");
            if (key && datasets[key])
                data.push(datasets[key]);
        });

        if (data.length > 0){
            $.plot(divLine, data, {           
          
                yaxis: { min: 0, axisLabel: "Duration (sec)",tickFormatter: function(val, axis) { return val ;} },
                xaxis: { 
                	mode: "time", 
                	timeformat: "%0m/%0d %0H:%0M",  
                	minTickSize: [12, "hour"] ,
                 	axisLabel: "Start Time",
                 	min: (getYesterdayDate(minTime)).getTime(),
      				    max: (getTomarrorDate(maxTime)).getTime()
                 },  
                grid: { /*%0m/%0d %0H:%0M*/ /*"%y/%m/%d "*/
                hoverable: true, 
                clickable: false, 
                mouseActiveRadius: 30,
                backgroundColor: { colors: ["#B0D5FF", "#5CA8FF"] }
                },label: {
                 show: true,
                 formatter: function(label,point){
                     console.log(point.label + '<br>'+ point.percent.toFixed(2) + '%');

                 }
             },points: { show: true },lines: { show: true},
            legend:{         
            container:divlegend,            
            noColumns: 0
            },
            
            });
    	}
    }



    divLine.UseTooltip();
    plotAccordingToChoices();

};

var maxTime = 0,
	minTime = 0;

function compareMaxTime(timestamp){
	if(timestamp > maxTime)
		return maxTime = timestamp;
}
function compareMinTime(timestamp){
	if(minTime == 0) return minTime = timestamp;
	if(timestamp < minTime)
		return minTime = timestamp;
}
function getYesterdayDate(timeStamp){
	var date = new Date(timeStamp);
	date.setDate(date.getDate() - 1);
	return date;
}

function getTomarrorDate(timeStamp){
	var date = new Date(timeStamp);
	date.setDate(date.getDate() + 1);
	return date;	
}

