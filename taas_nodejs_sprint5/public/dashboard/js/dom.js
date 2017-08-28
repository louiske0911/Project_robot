
/*dom.js : handle DOM and CSS*/


/*
* save all memo css while moving.
*/
var memoCSS = {}; // memoCSS[memo1]={object};
var memoCssWidth = {},
    memoCssHeight = {};
/*
* create Memo dom name
* mode = "pie/line/table/log...."
*/
function getMemoName(task, creatDate, createTime, mode){
    var curTab = getCookie("curTab");
    creatDate = creatDate.replace(/\//g,"_");
    createTime = createTime.replace(/:/g,"_");
    task = task.replace(/ /g,"___");
    var memoName =  curTab + "_" + task + "_" + creatDate+"_"+createTime;
    return "memo_border_" + memoName + "_" + mode;
}
/*
* create Memo dom name for summary
* 
*/
function getMemoSumaryName(projName){

    var curTab = getCookie("curTab");
   projName = projName.replace(/ /g,"___");
   return "memo_border_" + curTab + "_" + projName + "_summary";
}


$(document).ready(function() {

    

})



function selectDiv(grandGrandDiv, grandDiv, parentDiv, selfDiv){

    if(grandGrandDiv != null && grandDiv != null && parentDiv!=null && selfDiv!= null) 
        return $("#" + grandGrandDiv + " > #" + grandDiv + " > #" + parentDiv + " > #" +selfDiv);
    if(grandDiv != null && parentDiv!=null && selfDiv!= null) 
        return $("#" + grandDiv + " > #" + parentDiv + " > #" +selfDiv);
    else if(parentDiv!=null && selfDiv!= null) 
        return $( parentDiv + " > #" +selfDiv);
    else return "error";
}
/*
* create DOMs for Line chart needed
*
*/
function getDOMListbyMode(mode){
    var domList = null;
    switch(mode){
        case "lineChart":
            domList = {
                divTitle : "memoTitle",
                divLine  : "memoLine",
                divChoices  : "memoChoices",
               // divMsg  : "memoMsg",
                divlegend : "memoLegend"

            }
            break;
         case "messageTable":
            domList = {
                divTitle : "memoTitle",
                divMsg  : "memoMsg"
            }
            break;
        case "pieChart":
            domList = {
                divTitle : "memoTitle",
                divPie  : "memoPie",
                divTip  : "memoTip",
                divDateTime : "memoDateTime"
            }
            break;
        default:
            domList = null;
            break;
   }
    return domList;
}

function hasMemoDOM(tabDiv,memoName){

    if($("#"+tabDiv).has("#"+memoName).length > 0)
        return true;
    else
        return false;
}



function initMemoDOM(tabDiv,memoName){

    var memoDivGrop = '<div id=\"'+memoName+'\">';
        memoDivGrop += "<div id=\"memo_title\"></div>";
        memoDivGrop += "<div id=\"memo_report\"></div>";
        memoDivGrop += "</div>";
    $("#" + tabDiv).append(memoDivGrop);

}

function textToDOM(div){
    return "<div id="+div+"></div>";
}



/*@getRGBList: get RGB theme
*
*
* dark theme : https://color.adobe.com/zh/Blue1-color-theme-7783193/?showPublished=true
* pure_ranbow theme : https://color.adobe.com/zh/Soft-color-theme-7778195/?showPublished=true
*/
function getRGBList(theme){
  var listRGB = [];
  switch(theme){

    case "dark":
          listRGB = ["#163359","#5A90BF","#D9D8D7","#BF9780","#59372A"];
          break;
    case "pure_ranbow":
          listRGB = ["#2D4A72","#AFEFB8","#F0EDD5","#F2D87E","#DB6060"];
          break;
    case "dark_ranbow":
          listRGB = ["#F22D84","#4A188B","#01D94F","#D4D705","#F2843C"];//red blue green yellow orange
          break;
    default :
          listRGB.push()

  }

  return listRGB;
}

function getRGBListbyStatus(status){
  var rgb = '';
  status = status.toLowerCase();
  switch(true){

    case (status.search("pass") >= 0):
          rgb = "#A6E18D"//rgb = "#01D94F";
          break;
    case (status.search("fail") >= 0):
          rgb = "#3BA9F2"// rgb = "#F22D84";
          break;
    case (status.search("error") >= 0):
          rgb = "#FDE754"; //rgb = "#4A188B";
          break;
    case true:
          rgb = "#F3C9A3";
          break;
  }
  return rgb;
}

function hasExistDOM(tabDiv,memoName){
    if($("#"+tabDiv).children("#"+memoName).text().length >0)
        return true;
    else
        return false;
}

function hasExistDOMbyTab(memoName){
    var tab = getCookie("curTab");
    var tabDiv = "content" + tab;
    return hasExistDOM(tabDiv,memoName);
}

function showSaveBtn(){

  var curTab = getCookie("curTab");  
  /*
  $(".breadcrumb").children("li").html("<button id=\"save_layout\" type=\"button\" class=\"btn-primary \" onclick=\'saveCsstoDashLayout()\'>Save Dashboard</button>");
  $("#" +?€curTab).siblings(".save_btn").attr("onclick","saveCsstoDashLayout()");
  $("#" +?€curTab).siblings(".save_btn").css("visibility","visible");
  $("#" +?€curTab).mouseover();*/
  
  textToDOM("save_layout");
  var saveBtn = $("#save_layout");
  saveBtn.html("save");
  if(!$("#save_layout").attr("class")){
        $("body").append(textToDOM("save_layout"));
        $("#save_layout").attr("class","save_btn btn btn-success   glyphicon glyphicon-ok btn-xs");
        $("#save_layout" ).attr("onclick","getAskAutoReflesh()");
        $("#save_layout" ).attr("title","save this report!");

  }
  $("#save_layout").css({
                         "position":"absolute",
                         "visibility":"visible",
                         "top"   :  $("#" + curTab).parent("li").offset().top + 27,
                         "left"   : $("#" + curTab).parent("li").offset().left,
                         "width"   : $("#" + curTab).parent("li").width()-2
                        });
  $("#save_layout").click(function(){
    $("#save_layout").remove();
  })  
}


function saveCsstoDashLayout(callback) {
//console.log("saveCsstoDashLayout")
 // var  = askAutoRefleshDialog();
    if(JSON.stringify(memoCSS).length > 2){ //if not empty

        var nowTime = new Date().toLocaleString();
        $.ajax({
            type: "POST",
            url: "/saveCsstoDashLayout",
            async: false,
            data: {
                moveTime : nowTime,
                memoCSSObj : JSON.stringify(memoCSS),
              //  strAutoReflesh : strAutoReflesh
            },
            async: false,
            success: function(d) {
                return callback();
              // $(".breadcrumb").children("li").html("Dashboard");
            },
            error: function() {
                console.log("error");
            }
        });
      
    }

}


function askAutoRefleshDialog(askReflesh){
    //console.log("askAutoRefleshDialog")
    var curTab = getCookie("curTab");  
    var escapTab = curTab.replace(/_/g," ");
   // var askReflesh = getAskAutoReflesh(curTab);
    if(askReflesh == undefined ||askReflesh == "true"){
        BootstrapDialog.show({
                title: 'System Messages',
                message: 'Would you want to auto refresh <b> the '+ escapTab +' dashboard </b>when new report is generated?',
                buttons: [{
                    label: 'Yes',
                    cssClass: 'btn-primary',
                    action: function(dialogItself){
                       dialogItself.close();
                       return saveCsstoDashLayout(function(){
                        updateAskAutoReflesh(boolAsk = true, boolAuto = true);
                       });
                    }
                }, {
                    label: 'No',
                    cssClass: 'btn-info',
                    action: function(dialogItself){
                         dialogItself.close();
                          return saveCsstoDashLayout(function(){
                            updateAskAutoReflesh(boolAsk = true, boolAuto = false);
                          });
                    }
                }, {
                    icon: 'glyphicon glyphicon-ban-circle',
                    label: 'Don\'t ask me again' ,
                    cssClass: 'btn-warning',
                     action: function(dialogItself){
                         dialogItself.close();
                         return  saveCsstoDashLayout(function(){
                            updateAskAutoReflesh(boolAsk = false);
                        });
                    }
                    
                }, {
                    label: 'Close',
                    action: function(dialogItself){
                         dialogItself.close();
                         return saveCsstoDashLayout(function(){});
                    }
                }]
            });
    }else if (askReflesh == false || askReflesh == "false"){ //when dashboard drop but autoReflash is true

         return saveCsstoDashLayout(function(){});
    }
}

/*
* get AskAutoReflesh from db of tab message [STATISTICS_Schema]
*
*
*/
function getAskAutoReflesh(){
//console.log("getAskAutoReflesh")
var curTab = getCookie("curTab");
$.ajax({
        type: "GET",
        url: "/getAskAutoReflesh/" + curTab ,
        async: false,
        success: function(strTrueFalse) {
          return askAutoRefleshDialog(strTrueFalse);
        },
        error: function() {
              console.log("getAskAutoReflesh: not found");
     
        }
    });

}
/*
* get update AskAutoReflesh from db of tab message [STATISTICS_Schema]
* default =  true
* autoRefleshAsk: { //true: ask again, false: don't ask
*        type: Boolean,
*        default: true,
* } 
* 
*/
function updateAskAutoReflesh(boolAsk, boolAuto){
//console.log("updateAskAutoReflesh")

var curTab = getCookie("curTab");
$.ajax({
        type: "POST",
        url: "/updateAskAutoReflesh/" + curTab ,
        data:{
            boolAsk : boolAsk,
            boolAuto : boolAuto
        },
        async: false,
        success: function(res) {
          return console.log(res);
        },
        error: function(res) {
              console.log("updateAskAutoReflesh: not found" + res);
     
        }
    });

}

function saveNoShowtoDBbyDOM(div) {

    $.ajax({
        type: "POST",
        url: "/saveNoShowtoDBbyDOM",
        data: {
            dom:div
        },
        async: false,
        success: function(d) {
         //console.log(div);
        },
        error: function() {
            console.log("error");
        }
    });

}

function recordNowCssDOM(memo){
   // var memoLeft = Math.round(parseInt(memo.css("left"))/parseInt(memo.parent().css("width"))*10000)/100;
   //console.log(memo.position())
    var memoLeft =  memo.position().left;
    var memoTop = memo.position().top;
    if (memoTop != undefined ) memoTop = parseInt(memoTop);
    var memoWidth = memo.width();
    var memoHeight = memo.height();

    memoCSS[memo.attr("id")] = JSON.stringify({
        "position":"absolute",
        "left": memoLeft+"px",
        "top": memoTop+"px",
        "height" : memoHeight + "px",
         "width" : memoWidth + "px"
    });

}

function draggableDOM(div, objPosition){
// console.log(div)

    var memo =  $( "#"+div);
    // console.log(memo.position() )
    //memo initial place
    if(objPosition == null || objPosition == "" || memo.position() == undefined){
        memoCSS[div] = JSON.stringify({
              "position":"absolute",
               "left":"20%",
              // "top":parseInt(memo.parent().css("height"))*1.2+"px"
               "top":"20%"
        });

        memo.css(memoCSS[div]);
        memo.addClass("backboderYellow");
        //console.log(memoCSS[div])
       // console.log(memo)
       // recordNowCssDOM(memo);
    }else{

        memo.css(JSON.parse(objPosition));
       
    }

    memo.draggable({
    
            drag: function(){
                /*show saving button if not show*/
                if ($(".breadcrumb").has("li").has("#save_layout").length <=0){
                    showSaveBtn();                      
                }
                memo.removeClass("backboderYellow");
                $(".ui-widget-content").css({"border":"0px"})
                recordNowCssDOM(memo);

                //fixHeader(div);
                
            }
    });


    memo.children("#memo_title").hover(function(){
        //  var this = $(this);
        if($(this).has("#closeBtn").length <=0 ){

            var dropDown = "<div class=\"dropdown\" id=\"memoMenu\"> <span class=\"dropdown-toggle\" type=button  data-toggle=dropdown aria-haspopup=true aria-expanded=true> <span  class=\"glyphicon glyphicon-align-justify grey\" ></span></span>";
                dropDown += "<ul class=\"dropdown-menu\" aria-labelledby=\"menuSpace\">";
                dropDown += "<li id=\"origin\"><a href=\"#\">original report</a></li>";
                dropDown += "<li id=\"logMsg\"><a href=\"#\">log message</a></li>";
                dropDown += "</ul></div>";
            if(div.split("pi")[1] == "e") //only use at pie chart
                    $(this).append(dropDown);
            $(this).append("<img id=\"closeBtn\" src=\"/images/close.png\" >");
          
            $(this).children("#closeBtn").click(function(){
                //saveNoShowtoDBbyDOM(div);
                removeDashLayoutbyDOM(div,function(){});
                memo.remove();
            })
            $(this).children("#memoMenu").children("ul").children("li#origin").click(function(){
                //findDashLayoutbyDOMid(div);
                 createOriginData(null, div+"Origin", null);
                 
                 //var memoTitle = memo.children("#memo_title").children("#memoTitle").text();
                
            })
            $(this).children("#memoMenu").children("ul").children("li#logMsg").click(function(){
                //findDashLayoutbyDOMid(div);
                 //alert(div);
                 createLogMsgData(null, div+"LogMsg", null);

                
                
            })
            /*
            $(this).children("#memoMenu").click(function(){
                $(this).parent().append("<p id=\"menuSpace\">sss</p><ul class=\"dropdown-menu\" aria-labelledby=\"menuSpace\"><li class=\"dropdown-header\">Dropdown header</li><li class=\"dropdown-header\">Dropdown header</li></ul>");
            })
*/
            $(this).children("#closeBtn").css({"float":"right","position":"relative","cursor":"pointer"});
            $(this).children("#memoMenu").css({"float":"left","position":"relative","cursor":"pointer","margin-left":"5px"});
            memo.children("#menuSpace").css({"float":"left","position":"relative",
                    "cursor":"pointer","margin-left":"-55px"});
            
        }
     
    }).on( "mouseleave", function() {
        $(this).children("#closeBtn").remove();
        $(this).children("#memoMenu").remove();
  
    });;

}



/*
* create DOMs for Line chart needed
*
*/
function createTempltByMode(tabDiv, mode, memoName, draggableDOM_, objPosition){
    //console.log(memoName);
    initMemoDOM(tabDiv,memoName); //create init dom
    var domInitSelector = selectDOMByMode(tabDiv,"initial",memoName);//select initial dom
    var memoTitle = domInitSelector.memoTitle;
    var memoReport = domInitSelector.memoReport;
    var domList = getDOMListbyMode(mode);
    if(mode == "lineChart"){
        memoTitle.append(textToDOM(domList.divTitle)); //add sum dom to  initial dom
        memoReport.append(textToDOM(domList.divlegend));
        memoReport.append(textToDOM(domList.divLine));
        memoReport.append(textToDOM(domList.divChoices));

        var domSelector = selectDOMByMode(tabDiv,"lineChart",memoName); //select lineChart dom
        var divTitle = domSelector.divTitle;
        var divLine  = domSelector.divLine;
        var divChoices  = domSelector.divChoices;
        var divlegend =  domSelector.divlegend;

        $("#"+ memoName).css({
            //"border":"1px solid black",
            "position":"absolute",
            "width":"45%",
            "height":"350px",
            "background-color": "#DDDDDD",
            "left":"25%",
            "top":"40%"
        });
       memoTitle.css({
            "height":"26px",
            "border-bottom":"1px solid white",
            "background-color": "#DDDDDD",
            "width":"100%"
        });
        memoReport.css({
            //"border":"1px solid black"

        });
         divTitle.css({
            "position":"absolute",
            "width":"100%",
            "text-align":"center",
            "font-size":"16px",
            "font-weight":"500"
    
        });
       divlegend.css({
            "text-align":"center",
            "margin-left": "20px"
        });
       divLine.css({
            "float":"left",
             "width":"75%",
             "height":"300px"
        });
        divChoices.css({
            "width":"20%",
            "float":"left"
        });
     
        draggableDOM_(memoName, objPosition);
        $("#"+memoName).resizable({
            stop: function( event, ui ) {

                if ($(".breadcrumb").has("li").has("#save_layout").length <=0){
                    showSaveBtn();                      
                }
                recordNowCssDOM($(this));
                    
           }
       });
    }else if(mode == "messageTable"){
        memoTitle.append(textToDOM(domList.divTitle)); //add sum dom to  initial dom
        memoReport.append(textToDOM(domList.divMsg));
        var domSelector = selectDOMByMode(tabDiv,"messageTable",memoName); //select lineChart dom

        var divTitle = domSelector.divTitle;
        var divMsg  = domSelector.divMsg;


        $("#"+memoName).css({
            //"border":"1px solid black",
            "position":"absolute",
            "width":"20%",
            "height":"350px",
            "background-color": "#DDDDDD",
            "overflow-x" : "hidden",
            "overflow-y" : "scroll",
            "left":"25%",
            "top":"40%"
             });
        memoTitle.css({
            "height":"26px",
            "border-bottom":"1px solid white",
            "background-color": "#DDDDDD",
            "width":"100%"
        });
        memoReport.css({
             "font-size":"10px"
            //"border":"1px solid black"
        });
         divTitle.css({
            "position":"absolute",
            "width":"100%",
            "text-align":"center",
            "font-size":"16px",
            "font-weight":"500"
    
        });
         divMsg.css({
            "float":"left",
            "background-color": "#DDDDDD"
        });
       draggableDOM_(memoName, objPosition);
       $("#"+memoName).resizable({
            stop: function( event, ui ) {

                if ($(".breadcrumb").has("li").has("#save_layout").length <=0){
                    showSaveBtn();                      
                }
                recordNowCssDOM($(this));
                  
           }
       });

       //fixHeader(memoName);

    }else if(mode == "pieChart"){
        memoTitle.append(textToDOM(domList.divTitle)); //add sum dom to  initial dom
        memoReport.append(textToDOM(domList.divPie));
        memoReport.append(textToDOM(domList.divTip));
        memoReport.append(textToDOM(domList.divDateTime));
        var domSelector = selectDOMByMode(tabDiv,"pieChart",memoName); //select pie chart dom
        var divTitle = domSelector.divTitle;
        var divPie  = domSelector.divPie;
        var divTip  = domSelector.divTip;
        var divDateTime  = domSelector.divDateTime;

        $("#"+memoName).css({
           // "border":"1px solid black",
           "position":"absolute",
            "width":"20%",
            "height":"350px",
            "background-color": "#DDDDDD",
            "left":"25%",
            "top":"40%"
        });
        memoTitle.css({
            "height":"26px",
            "border-bottom":"1px solid white",
            "background-color": "#DDDDDD",
            "width":"100%"
        });
        memoReport.css({
            //"border":"1px solid black"
        });
         divTitle.css({
            "position":"absolute",
            "width":"100%",
            "text-align":"center",
            "font-size":"16px",
            "font-weight":"500"
    
        });
        divPie.css({
            "float":"left",
             "width":"100%",
             "height":"250px"
        });
        divTip.css({
            "float":"left",
            "width":"100%",
            "font-size":"14px",
            "height":"30px",
            "text-align":"center"
        });
         divDateTime.css({
            "float":"left",
            "width":"100%",
            "height":"26px",
            "font-size":"14px",
            "text-align":"center"
        });

            draggableDOM_(memoName, objPosition);
            $("#"+memoName).resizable({
            stop: function( event, ui ) {

                if ($(".breadcrumb").has("li").has("#save_layout").length <=0){
                    showSaveBtn();                      
                }
                recordNowCssDOM($(this));
                  
           }
       });
       
    }
   // alert(memoName + " : "+$("#"+memoName).attr("class") );   
    //return divs_linChart;
}

function fixHeader(memoName){

           $("#"+memoName).scroll(function(){
         var header = $("#"+memoName).children("#memo_title"), 
             scroll = $("#"+memoName).scrollTop(),
             resizer = $("#"+memoName).children(".ui-resizable-handle"),
             memoTop = $("#"+memoName).position().top,
             scrollWindow = $(window).scrollTop();
         if (scroll >= 20 ) {
            header.addClass('fixed');
            $('.fixed').width($("#"+memoName).width());
            $('.fixed').css("top",memoTop - scrollWindow);
        }
        else{
            header.removeClass('fixed');
            //resizer.removeClass('fixed');
        }

        });
}

function selectDOMByMode(tabDiv, mode, memoName){


    var domList = null;
    var lineDOMs = getDOMListbyMode(mode);
    switch(mode){
        case "initial":
             domList = {

                memoTitle :selectDiv(null,tabDiv, memoName , "memo_title"),
                memoReport  : selectDiv(null,tabDiv, memoName , "memo_report")
        
            }
            break;
        case "lineChart":
             domList = {
                divTitle : selectDiv(tabDiv, memoName , "memo_title" , lineDOMs.divTitle),
                divLine  : selectDiv(tabDiv,  memoName , "memo_report" , lineDOMs.divLine),
                divChoices  : selectDiv(tabDiv,  memoName , "memo_report" , lineDOMs.divChoices),
                divlegend : selectDiv(tabDiv,  memoName , "memo_report" , lineDOMs.divlegend)
            }
            break;
        case "messageTable":
             domList = {
                divTitle : selectDiv(tabDiv, memoName , "memo_title" , lineDOMs.divTitle),
                divMsg  : selectDiv(tabDiv, memoName , "memo_report" , lineDOMs.divMsg)
               
            }
            break;
        case "pieChart":
             domList = {
                divTitle : selectDiv(tabDiv, memoName , "memo_title" , lineDOMs.divTitle),
                divPie  : selectDiv(tabDiv,  memoName , "memo_report" , lineDOMs.divPie),
                divTip  : selectDiv(tabDiv,  memoName , "memo_report" , lineDOMs.divTip),
                divDateTime : selectDiv(tabDiv,  memoName , "memo_report" , lineDOMs.divDateTime)
               
            }
            break;
        default:
            domList = null;
            break;
    }
    return domList;

}
