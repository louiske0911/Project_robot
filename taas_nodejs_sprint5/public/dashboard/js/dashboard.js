
/*
* 2016/03/21 kristen
* drawPieChart
*
* 2016/02/25 kristen
* switch button : Over Detail
*/

var JobofDOM = []; //JobofDOM[div] = [JobName,JobType,JobRunNumber]
var JobofTask = []; //JobofDOM[div] = task
var AutoReflesh = [];//JobofDOM[div] = true/false
$(document).ready(function() {

})


function removeTabContent(tab){
  $("#content"+tab).text();
  //console.log("#content"+tab)
  //console.log($("#content"+tab).val())
}
/*
*  for tab initial view 
*  get memo list form db by tab
*  add.js / getTabContent() -> showDashLaybyTab()
*/
function showDashLaybyTab(tab) {
    var nowTime = new Date().toLocaleString();
    tabOpened[tab] = 1;
    $.get("/showDashLaybyTab/"+ tab ,function(memoList){
     //console.log(memoList)
    
    var jsonMemoList = JSON.parse(memoList).memoList;
    var autoReflesh = JSON.parse(memoList).autoReflesh;

        for(var i in jsonMemoList){
          var parmList = jsonMemoList[i].parmList;
          var taskName = jsonMemoList[i].task;
          var arrayJob = jsonMemoList[i].job;
          var dom = jsonMemoList[i].dom;
          var css = jsonMemoList[i].css;
          var tab = jsonMemoList[i].tab;
          if(autoReflesh == true) $("#"+dom).remove();
          //save to public array
          JobofDOM[jsonMemoList[i].dom] =jsonMemoList[i].job;
          JobofTask[jsonMemoList[i].dom] = jsonMemoList[i].task;
           
          switch (jsonMemoList[i].chartType){
            case "pie":
                if(autoReflesh == true)
                  getRunStatusByTime(tab, arrayJob[1], arrayJob[0], "dateTime", "pie", taskName, dom, css);
                else
                  drawPieFlot(save = false, tab, JSON.parse(parmList[0]), parmList[1], parmList[2], parmList[3], css);
                 // prepareReportData(null, null, taskName, job[1], null, 0, job[0], "chart");
                break;
            case "message":
                if(autoReflesh == true)
                  addReport(parmList[0], tab, autoReflesh, css, showFailOnly = true);//project name
                else
                  drawFailMessage(tab, parmList[0], parmList[1], parmList[2], css);
                break;
            case "line":
                if(autoReflesh == true)
                  addReport(parmList[0], tab, autoReflesh, css);
                else
                  drawLineFlot(tab, parmList[0],JSON.parse(parmList[1]), parmList[2], css);
                break;
            case "origin":
                if(autoReflesh == true)
                  getRunStatusByTime(tab, arrayJob[1], arrayJob[0], "dateTime", "origin", taskName, dom, css);
                else
                  createOriginData(tab, dom, taskName, arrayJob, css, autoReflesh);
                break;
            case "logMsg":
                if(autoReflesh == true)
                  getRunStatusByTime(tab, arrayJob[1], arrayJob[0], "dateTime", "logMsg", taskName, dom, css);
                else
                  createLogMsgData(tab, dom, taskName, arrayJob, css, autoReflesh);
                break;
            default:
                break;
          }

          
        }
   
    
   })
    

}

function closeTab(){

 var tab = getCookie("curTab");
    $.ajax({
        type: "POST",
        url: "/removeTab",
        data: {
            tab: tab

        },
        async: false,
        success: function(d) {
           // console.log("success::savetoDashLayout");
        },
        error: function() {
            console.log("error");
        }
    });

}







function recover_savingBtn(){

  $(".breadcrumb").children("li").text("Dashboard");
}

function savetoDashLayout(tab, task, chartType, moveTime, dom, css, parmList) {

 //var arrayJob = [JobName, JobType, JobRunNumber];
 //var autoRefleshTemp = false;
 var strUpperFrist = chartType.charAt(0).toUpperCase() + chartType.slice(1);

 if(JobofDOM[dom] == null || JobofDOM[dom] == undefined){
  JobofDOM[dom] = JobofDOM[dom.split(strUpperFrist)[0]];
 }
 //console.log(JobofDOM)
 
 //if(AutoReflesh[dom] == true) autoRefleshTemp = true;
 //var tab = getCookie("curTab");

    $.ajax({
        type: "POST",
        url: "/savetoDashLayout",
        data: {
            tab: tab,
            task: task,
            chartType: chartType,
            moveTime:moveTime,
            dom: dom,
            css: css,
            parmList: parmList,
            job: JobofDOM[dom]
            //autoReflesh : autoRefleshTemp

        },
        async: false,
        success: function(d) {
            //console.log("success::savetoDashLayout" +dom);
        },
        error: function() {
            console.log("error");
        }
    });

}

/**
 * Control show or hide block
 */
/*
function switchOverDetail(onOff){
  if(onOff == "on"){ //show Overview
    //alert("on");
    $('#switchOverview' ).attr("style","display:block;");
    $('#switch' ).attr("style","display:none;");
    $('#switchDetail' ).attr("style","display:none;");
    $('#addreport').attr("style","display:block;");
  }else if(onOff == "none"){
    //alert("none");
    $('#switchOverview' ).attr("style","display:none;");
    $('#switch' ).attr("style","display:none;");
    $('#switchDetail' ).attr("style","display:none;");
    $('#addreport').attr("style","display:block;");
  }else{
    //alert("Off");
    $('#switchOverview' ).attr("style","display:none;");
    $('#switch' ).attr("style","display:block;");
    $('#switchDetail' ).attr("style","display:block;border-left: 1px solid #dddddd;border-right: 1px solid #dddddd;");
    $('#addreport').attr("style","display:none;");
  }

}*/
//<<<<<<< HEAD




/*
*
* 2016/03/02 kristen
* draw Pie Chart data by google chart
*
* 2016/02/25 kristen
* initial draw Pie Chart data by hightchart
*/

function arrayDataTotal(dataTotal){
  var arrData = dataTotal.split("\n");
  for(var i = 0; i<arrData.length; i++){
   console.log(arrData[i]);    
  }
}

/**
 * parseReportData
 * @param {json} jsonData Attributes:
 *   <ul>
 *     <li>retdata : retdata object</li>
 *     <li>$.get("/getSelePytPie"...): get getSelePytPie data 
 *      [{
 *                 taskName : tab,
 *                 taskType : jobType,
 *                 title: info.title,
 *                 fieldNames : info.fieldNames,
 *                 fieldUnits : info.fieldUnits,
 *                 dimension : info.dimension,
 *                 series : [{z: 'fieldName 1', x: 'x value 1-1', y: 'y value 1-1'},
 *                         {z: 'fieldName 1', x: 'x value 1-2', y: 'y value 1-2'}...,
 *                         {z: 'fieldName 2', x: 'x value 2-1', y: 'y value 1-2'},
 *                         {z: 'fieldName 2', x: 'x value 2-2', y: 'y value 2-2'},...]
 *       }]    
 *
 *       </li>
 *
 *    </ul>
 */
function getDatabyKey(jsonData,key){

  if(Object.keys(jsonData).indexOf(key) > -1){
    return jsonData[key];
  }else
    return "error: key not found!";

}

function createFlotDatabyKey(series, dimension){
  var dataSet = [];
  if(series != null || series != ""){
    var colorIn = 0 ;
     while( series != null && series.length > 0){
      //console.log(series.length);
      var xyzObj = series.pop();
      if(dimension == 2){
       // console.log(xyzObj);
        //dataSet.push({ label: xyzObj["x"], data: xyzObj["y"], color: getRGBList("dark_ranbow")[colorIn++] });
        dataSet.push({ label: xyzObj["x"], data: xyzObj["y"], color: getRGBListbyStatus(xyzObj["x"]) });
      }
    }
      //console.log(dataSet);
    return dataSet;
  }else{
    //console.log("error: no data; by createFlotDatabyKey");
    return null; 
  }

}

/*
function async(your_function, callback) {
    setTimeout(function() {
        your_function();
        if (callback) {callback();}
    }, 0);
}*/


// getRunStatusByTime("origin", arrayJob[1], arrayJob[0], "dateTime", "chart", taskName, dom, css);

function getRunStatusByTime(tab, jobType, jobName, getElement, chartType, taskName, oldDom, css){
//console.log("xxxxxxx")

//console.log(jobType)

//var curTab = getCookie("curTab");
$.ajax({
        type: "POST",
        url: "/getRunStatus" ,
        data: {
          getElement :getElement,
          jobType : jobType,
          jobName : jobName
        },
        success: function(resData) {
          var objData = JSON.parse(resData);
          objData = objData.pop();
          var dom = getMemoName(taskName, objData.date, objData.time, "pie"); 
           //console.log(chartType)
           //console.log(";;;;;;;;;;;;;;")
           //console.log(resData)
          switch (chartType){
            case "pie":
              //AutoReflesh[dom] = true;
              getRunningOrnot(jobName, jobType, function(runStatus){
                //console.log("runStatus" +runStatus)
                if(runStatus == null || runStatus == "" || runStatus == "ABORTED" || runStatus == "ERROR") {
                  createTempltByMode(tabDiv = "tab"+ tab, "messageTable", memoName = oldDom, draggableDOM, css);
                  var domMsgSelector = selectDOMByMode(tabDiv,"messageTable",memoName);
                  var divMsgTitle = domMsgSelector.divTitle;
                  var divMsg  =  domMsgSelector.divMsg;
                  divMsgTitle.text(taskName);
                   if(runStatus == "ABORTED"){
                    divMsg.html("ABORTED");
                    widthMsg = 7 * 10;
                  }else if(runStatus == "ERROR"){
                    divMsg.html("ERROR");
                    widthMsg = 3 * 10;
                  }else{
                    divMsg.html("RUNNING");
                    widthMsg = 17 * 10 ;
                  }
                    divMsg.css({
                      "float": "",
                      "font-size": "20px",
                      "width": widthMsg +"px",
                      "height": "30px",
                      "margin": "0px auto",
                      "margin-top": "150px",
                      "_margin": "0px auto",
                      "*margin": "0px auto"
                      
                     });
                }else{
                  removeDashLayoutbyDOM(oldDom, function(callback) {
                    //console.log("$$$$$$$$$removeDashLayoutbyDOM" + oldDom)
                    prepareReportData(save = true, tab, objData.date, objData.time , taskName, jobType, null, 0, jobName, chartType, dom, css);
                  });
                }
              })
              
            break;
            case "origin":
              dom = dom+"Origin";
              //AutoReflesh[dom] = true;
              JobofDOM[dom] =  [jobName,jobType,0];
              JobofTask[dom] = taskName;
              getRunningOrnot(jobName, jobType, function(runStatus){
                if(runStatus == null || runStatus == "" || runStatus == "ABORTED" || runStatus == "ERROR") {
                  createTempltByMode(tabDiv = "tab"+ tab, "messageTable", memoName = oldDom, draggableDOM, css);
                  var domMsgSelector = selectDOMByMode(tabDiv,"messageTable",memoName);
                  var divMsgTitle = domMsgSelector.divTitle;
                  var divMsg  =  domMsgSelector.divMsg;
                  divMsgTitle.text(taskName + " original report");
                  var widthMsg = 0;
                  if(runStatus == "ABORTED"){
                    divMsg.html("ABORTED");
                    widthMsg = 7 * 10;
                  }else if(runStatus == "ERROR"){
                    divMsg.html("ERROR");
                    widthMsg = 3 * 10;
                  }else{
                    divMsg.html("RUNNING");
                    widthMsg = 17 * 10 ;
                  }
                    divMsg.css({
                      "float": "",
                      "font-size": "20px",
                      "width": widthMsg +"px",
                      "height": "30px",
                      "margin": "0px auto",
                      "margin-top": "150px",
                      "_margin": "0px auto",
                      "*margin": "0px auto"
                      
                     });
                   
                }else{
                   removeDashLayoutbyDOM(oldDom, function(callback) {
                    /*  console.log("origin")
                      console.log("tab" + tab)
                       console.log("objData.date" + objData.date)
                        console.log("objData.time" + objData.time)
                         console.log("taskName" + taskName)
                         console.log("jobType" + jobType)
                          console.log("jobName" + jobName)
                            console.log("chartType" + chartType)
                             console.log("dom" + dom)
                              console.log("css" + css)
                               console.log(css)*/
                      prepareReportData(save = true, tab, objData.date, objData.time , taskName, jobType, null, 0, jobName, chartType, dom, css);
                    });
                }
              })
              
              break;
            case "logMsg":
              dom = dom+"LogMsg";
              //AutoReflesh[dom] = true;
              JobofDOM[dom] =  [jobName,jobType,0];
              JobofTask[dom] = taskName;
              getRunningOrnot(jobName, jobType, function(runStatus){
                 if(runStatus == null || runStatus == "" || runStatus == "ABORTED" || runStatus == "ERROR") {
                   createTempltByMode(tabDiv = "tab"+ tab, "messageTable", memoName = oldDom, draggableDOM, css);
                  var domMsgSelector = selectDOMByMode(tabDiv,"messageTable",memoName);
                  var divMsgTitle = domMsgSelector.divTitle;
                  var divMsg  =  domMsgSelector.divMsg;
                  divMsgTitle.text(taskName + " log report");
                   if(runStatus == "ABORTED"){
                    divMsg.html("ABORTED");
                    widthMsg = 7 * 10;
                  }else if(runStatus == "ERROR"){
                    divMsg.html("ERROR");
                    widthMsg = 3 * 10;
                  }else{
                    divMsg.html("RUNNING");
                    widthMsg = 17 * 10 ;
                  }
                    divMsg.css({
                      "float": "",
                      "font-size": "20px",
                      "width": widthMsg +"px",
                      "height": "30px",
                      "margin": "0px auto",
                      "margin-top": "150px",
                      "_margin": "0px auto",
                      "*margin": "0px auto"
                      
                     });

               }else {
                    removeDashLayoutbyDOM(oldDom, function(callback) {
                    prepareReportData(save = true, tab, objData.date, objData.time , taskName, jobType, null, 0, jobName, chartType, dom, css);
                });
               }
              })
              break;

          }
          
          return true;
          //return saveNoShowtoDBbyDOM(dom);
         
        },
        error: function() {
              console.log("error: prepare Chart Data");
     
        }
    });

}

function prepareReportData(save, tab, creatDate, createTime, taskName, taskType, runResult, runNumber, jobName, mode, dom, objPosition){

//if(tab == null ) tab = getCookie("curTab");
//var curTab = getCookie("curTab");
$.ajax({
        type: "POST",
        url: "/prepareReportData/" + mode ,
        data: {
          tab :tab,
          creatDate : creatDate,
          createTime : createTime,
          taskName : taskName,
          taskType : taskType,
          runResult : runResult,
          runNumber : parseInt(runNumber),
          jobName : jobName
        },
        success: function(resData) {
        

          if(resData == "Running"){

            alert("Task is executed, please wait.");
           
          }else if(resData == "noStatus"){
            if(runResult == "" || runResult == null)
              alert("Task is executed, please wait.");
            else
              alert("No report!");
           
          }else if(resData == "noFile"){

            alert("No report!");
            

          }else if(mode == "pie"){
            
            var memoName = getMemoName(taskName, creatDate, createTime, "pie"); 
            //if (hasExistDOMbyTab(memoName) == false){
              JobofDOM[memoName] = [jobName,taskType,runNumber];
              JobofTask[memoName] = taskName;

              var jsonData = JSON.parse(resData);
              jsonData =  jsonData.pop();
              var series = getDatabyKey(jsonData,"series");
              var dimension = getDatabyKey(jsonData,"dimension");
              var seriesFlot = createFlotDatabyKey(series,dimension);
             // isDomExisted(memoName, function(){
                drawPieFlot(save = true, tab, seriesFlot, taskName,creatDate, createTime, objPosition);//first create objPosition = null
              //})
              //for other report to serch job message
            //}
          }else if(mode == "origin"){
            //console.log(jobName+"~"+taskType+"~"+ runResult+"~"+runNumber)
              genOriginReport(save = true, tab, "origin", dom, taskName, resData, objPosition);
          }else if(mode == "logMsg"){
              var htmlLog = resData.replace(/\n/g,"<br />");
              genOriginReport(save = true, tab, "logMsg", dom, taskName, htmlLog, objPosition);
          }
         
        },
        error: function() {
              console.log("error: prepare Chart Data");
     
        }
    });

}


/*
* //return [job Name, job type, run number]
*
*/
/*
function findDashLayoutbyDOMid(dom){

var curTab = getCookie("curTab");
$.ajax({
        type: "GET",
        url: "/findDashLayoutbyDOMid/" +dom ,
        success: function(layout) {
          var objLay = JSON.parse(layout);
          prepareReportData(null, null, null, objLay.task, objLay.job[2], null, objLay.job[2], objLay.job[0], "origin",dom,null);
         

        },
        error: function() {
              console.log("findJobOptbyDOMid: not found");
     
        }
    });

}*/
function isDomExisted(dom, callback){


$.ajax({
        type: "GET",
        url: "/isDomExisted/" + dom,
        success: function(strBool) {
          if(strBool == "true") return true;
          else return callback();
        },
        error: function() {
              console.log("isDomExisted: not found");
     
        }
    });

}

/*

      "job" : [
                "Selenium-20160418-9b9b627a",
                "test/selenium",
                prepareReportData(creatDate, createTime, taskName, taskType, runResult, runNumber, jobName, mode, dom, objPosition)
                 createOriginData(dom, taskName, arrayJob, objPosition, autoReflesh);
*/

function createOriginData(tab, dom, task, objJob , originCss, autoReflesh){
/*console.log(dom)
console.log(task)
console.log(objJob)
console.log(originCss)
console.log(autoReflesh)
console.log(JobofDOM[brotherDOM])*/
 var brotherDOM = dom.split("Origi")[0];
  if( JobofDOM[brotherDOM] != undefined && task == null ) {// origin must has brotherDOM report otherwise no show 
    //console.log(JobofDOM[brotherDOM])
    prepareReportData(save = false, tab, null, null, JobofTask[brotherDOM] , JobofDOM[brotherDOM][1], null, JobofDOM[brotherDOM][2], JobofDOM[brotherDOM][0], "origin",dom,originCss);
  }else{
    var runNumber = 0;
    if(autoReflesh == false)runNumber = objJob[2];
    var taskType = objJob[1];
    var jobName =  objJob[0];
    //console.log(jobName)
   // prepareReportData(null, null, task, objJob[1], null, runNumber, objJob[0], "origin",brotherDOM,originCss);
    prepareReportData(save = false, tab, null, null, task, taskType, null, runNumber, jobName, "origin", dom, originCss);
  }
}

function createLogMsgData(tab, dom, task, objJob , originCss, autoReflesh){
 /* var runNumber = 0;
 if(autoReflesh == false )runNumber = objJob[2];
 var brotherDOM = dom.split("LogMsg")[0];
   if( JobofDOM[brotherDOM] != undefined && task == null ) // origin must has brotherDOM report otherwise no show 
    prepareReportData(null, null, JobofTask[brotherDOM] , JobofDOM[brotherDOM][1], null, JobofDOM[brotherDOM][2], JobofDOM[brotherDOM][0], "origin",brotherDOM,originCss);
  else
    prepareReportData(null, null, task, objJob[1], null, runNumber, objJob[0], "logMsg",brotherDOM,originCss);
*/
var brotherDOM = dom.split("LogMsg")[0];
  if( JobofDOM[brotherDOM] != undefined && task == null ) {// origin must has brotherDOM report otherwise no show 
    prepareReportData(save = false, tab, null, null, JobofTask[brotherDOM] , JobofDOM[brotherDOM][1], null, JobofDOM[brotherDOM][2], JobofDOM[brotherDOM][0], "logMsg",dom,originCss);
  }else{
    var runNumber = 0;
    if(autoReflesh == false) runNumber = objJob[2];
    var taskType = objJob[1];
    var jobName =  objJob[0];
   // prepareReportData(null, null, task, objJob[1], null, runNumber, objJob[0], "origin",brotherDOM,originCss);
    prepareReportData(save = false, tab, null, null, task, taskType, null, runNumber, jobName, "logMsg", dom, originCss);
  }
}

function removeDashLayoutbyDOM(dom,callback){

    $.ajax({
            type: "POST",
            url: "/removeDashLayoutbyDOM/"+dom ,
            data:{},
            success: function(resData) {
              console.log("remvoe success")
            return callback(); //
             
            },
            error: function() {
                  console.log("error: removeDashLayoutbyDOM"+dom);
         
            }
    });
 
}

function getRunningOrnot(jobName, jobType, callback){
 
//console.log(jobName+jobType)
    $.ajax({
        type: "POST",
        url: "/getRunningOrnot",
        data: {
            jobName: jobName,
            jobType : jobType

        },
        async: false,
        success: function(strRes) {
         
            callback(strRes);
           // console.log(strRes);
        },
        error: function() {
            console.log("error");
        }
    });

}

/*

function removeDashLayoutbyDOM(dom,callback){

  return callback(function(){

    $.ajax({
        type: "POST",
        url: "/removeDashLayoutbyDOM/"+dom ,
        data:{},
        success: function(resData) {
        return callback(); //
         
        },
        error: function() {
              console.log("error: removeDashLayoutbyDOM"+dom);
     
        }
    });

  })

}*/


