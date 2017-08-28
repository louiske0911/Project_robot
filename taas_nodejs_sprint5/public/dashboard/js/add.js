/*
 *
 * 2016/03/02 
 * move function reportDetails to dashboards.js by kristen
 *
 */

var IFCHART = false;
var CURRENTTAB = "";
var EXDAYS = 30;

/**
 * Display the recently opened tab.
 * If no recently opened tab, open the first tab.
 */
$(document).ready(function() {
    var curTab = getCookie("curTab");

    var tabs = $(".tab-content").html();
    if (tabs != "")
        $("a").filter("[id='" + curTab + "']").tab('show');
    else {
        $('.nav-tabs a:first').tab('show'); // reload tab display
        $('#addreport').attr("style", "display:none;");
    }
});

/**
 * Dashboard add report select project and task
 * after choose task call addChartline function
 * Give statistics schema proj_id field default value
 */
$(document).ready(function() {
    $("#dashtab").change(function() { //add report : seledt project
        var curTab = getCookie("curTab");
        $("#txtHint").text("");
        var divs_linChart = [];
        var selectProj = $(this).children(":selected").val();
        if (selectProj != "") {
            IFCHART = true;
            addReport(selectProj, curTab, false, null);
        }
    });
});


function addReport(project, tabname, autoReflesh, position, showFailOnly){
            $.ajax({
                type: "POST",
                url: "/addReport",
                data: {
                    project: project,
                    tabname: $("[id='" + tabname + "']").text()
                },
                async: false,
                success: function(dataTaskRunTime) {
                    //console.log(dataTaskRunTime)
                        var jsonData = JSON.parse(dataTaskRunTime);
                        var objTableOption = jsonData.pop();
                        var objRunTime = jsonData.pop();
                        if(showFailOnly == true){
                            var msgMemo = getMemoSumaryName(objRunTime.project)+"_msg";
                            removeDashLayoutbyDOM(msgMemo, function() {
                                // console.log("***1" + msgMemo)
                                drawLineFlot(null, project, objRunTime, getMemoSumaryName(objRunTime.project), position, autoReflesh,showFailOnly = true);
                            })

                           
                        }else if(autoReflesh == true) {
                           
                            var msgMemo = getMemoSumaryName(objRunTime.project);
                            removeDashLayoutbyDOM(msgMemo, function() {
                                // console.log("***2" +msgMemo)
                                drawLineFlot(null, project, objRunTime, getMemoSumaryName(objRunTime.project), position, autoReflesh);
                            });
                        }else{
                           // console.log(objTableOption.tableOption)
                            createTaskReport_optTable(objTableOption.tableOption,function(){
                                drawLineFlot(null, project, objRunTime, getMemoSumaryName(objRunTime.project) , position, showFailOnly = false);
                            });
                        }
                },
                error: function() {
                    console.log("error : dashtab change");
                }
            });


}

/**
 * When press "enter" key in tab textbox, trigger addTab function.
 */

$('#tab').keypress(function(e) {
    var key = e.which;
    if (key == 13) {
        addTab();
    }
});


/**
 * Auto focus to tab inputText when click "+ Create Dashboard"
 */
$('#myModal').on('shown.bs.modal', function() {
    $('#tab').focus();
});

/**
 * click tab
 * Show the tab contant.
 */
var tabOpened = {} ;
$('.show-contact').click(function(e) {
    e.preventDefault();
    var tab = $(this).attr("id");
    setCookie("curTab", tab, 30);
    $(this).tab('show');
    tabOpened["e"] = 1;
    //console.log("xxx .show-contact " + tab + "...." +tabOpened)
    //console.log(tabOpened)
    if(tabOpened[tab] != 1){
        showDashLaybyTab(tab); //show tab content
        //console.log("true")
    }

    $("#save_layout").remove(); //remove save button
  
    //location.reload();
});



/**
 * Remove the tab.
 */
$('.del-tab').click(function() {

    // if the del-tab is current tab, reload the tab
    var curTab = getCookie("curTab");
    if (curTab == $(this).parentsUntil("ul").siblings('a').attr('id')) {
        setCookie("curTab", "", EXDAYS);
    }

    // remove tab
    var delTab = $(this).parents().parents().children('a').attr('id');
    var delID = $(this).attr("id");
    //alert("delID :" +delID)
    // alert("curTab :" +curTab)
    $.ajax({
        type: "POST",
        url: "/removeDashLayoutbyTab/" + delID  + "/" + delTab,
        success: function(d) {
               
            location.reload();
        },
        error: function() {
            console.log("error: removeDashLayoutbyTab/" +delID + "tab- " + delTab +"never done");
            //location.reload();
        }
    });
});

/**
 * Add a tab.
 */
function addTab() {
    var tabName = $("#tab").val().replace(/ /g, "____"); //escape space char
    if (tabName != false) {

        checkTabRepeat(tabName, function(isRepeat) {
            if (!isRepeat) {
                $.ajax({
                    type: "POST",
                    url: "/addTab",
                    data: {
                        tabname: tabName,
                      //  selectTab: tabName, //$("#selectTab").val(),
                        hasContent: "0"
                    },
                    async: false,
                    success: function(d) {
           
                        $("#tab").val(""); // for firefox
                        setCookie("curTab", tabName, EXDAYS);
                        
                        location.reload();
                    },
                    error: function() {
                        alert("error");
                    }
                });
            } else
                alert("Tab name is repeat");
        });
    } else {
        alert("Please enter name");
    }
  
}

/**
 * Auto display the tab which is latest opened.
 */

function autotab() {
    var curTab = getCookie("curTab");
    //alert(curTab);
    var tabs = $(".tab-content").html();
   // console.log(curTab)
   // if (curTab == "" || curTab == "undefinded") {
    if (curTab == "" || curTab == "undefinded") {
        var arr = $(".show-contact");

        if(arr.length > 0){
            curTab = arr[0].innerHTML;
            console.log("innerHTMLxxx"+curTab);
            $(".container_dashboard > ul > li > #"+ curTab).trigger('click');
            //console.log("curTab--" + curTab)
            setCookie("curTab", curTab, EXDAYS);
        }
    }else{
         $("#" + curTab).click();
        // getTabContent(curTab);
    }

}


/**
 * Set a cookie
 * @param {String} cookie (variable) name
 * @param {String} cookie value
 * @param {Number} cookie deadline
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
 * Get the cookie's value
 * @param {String} cookie (variable) name
 */
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

/**
 * Check the tab is repeat or not.
 * @param {string} the tab name which you want to check.
 * @param {fn} callback receives the trigger response. Parameters:
 *   <ul>
 *     <li>isRepeat (bool): if the tab name is repeat, it will return true.Otherwise, it will return false.</li>
 *   </ul>
 */
function checkTabRepeat(tabName, callback) {
    var checkedValues = new Array();
    $(".show-contact").each(function(i, item) {
        if ($(item).attr("id") == tabName)
            checkedValues.push("repeat");
    });
    if (checkedValues.length > 0)
        return callback(true);
    else
        return callback(false);
}

/*
* create a table for all task running list when push "add report"
* which is showing at popuping dialog 
* @param {object} : table content format to like this -> [[col1,col2,...],[col1,col2,...],[]]
* @param {function} :for click to drawing line chart of run tasks summary.
*/

function createTaskReport_optTable(dataSet,funDrawLineFlot) {
    
    var curTab = getCookie("curTab");
    var taskOptTable;
    if ( $.fn.dataTable.isDataTable( '#taskReport_optTable' ) ) {

        taskOptTable = $('#taskReport_optTable').dataTable();
        taskOptTable.fnClearTable(); //load new data to datatable
        taskOptTable.fnAddData(dataSet);
        taskOptTable.fnDraw();
    
    }else {
        taskOptTable = $('#taskReport_optTable').dataTable( {
            data: dataSet,
            columns: [
                { title: "Runing Date" },
                { title: "Time" },
                { title: "Task Name" },
                { title: "Task Type" },
                { title: "Result" },
                { title: "Job Number" },
                { title: "Job Name" }
            ],
             "order": [[ 0, "desc" ],[ 1, "desc" ]],
            "columnDefs": [
                {
                    "targets": [ 5 ],
                    className: "hideDiv"
                },
                {
                    "targets": [ 6 ],
                    className: "hideDiv"
                   
                }
            ],
            "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {
                   // alert(iStart +" to "+ iEnd);
                },
            
            
        } );


}
    
/*
* dashboard.js : 
* var JobName,
*     JobType,
*     JobRunNumber;
*
*/
  $('#taskReport_optTable tbody').on( 'click', 'tr', function () {
        var nTds = $('td', this);
        var creatDate = $(nTds[0]).text();  
        var createTime = $(nTds[1]).text();
        var taskName = $(nTds[2]).text();
        JobType = $(nTds[3]).text();
        var runResult = $(nTds[4]).text();
        JobRunNumber = $(nTds[5]).text();
        JobName = $(nTds[6]).text();

        prepareReportData(save = true, null, creatDate, createTime, taskName, JobType, runResult, JobRunNumber, JobName, "pie");
        showSaveBtn();//show save button
        $(".close").click();//close message box

    });

    //create a task summary DOM for  clicking  to draw line chart
    var clicktoDrawRunTimeofTasks = $("<div id=\"runTimeofTasks_LineFlot\" class=\"button_text btn btn-primary\"></div>").text("Project Summary");  
    //var clicktoShowFailTask = $("<div id=\"runTimeofTasks_FailList\" class=\"button_text\"></div>").text("Tasks Fail List");  
   
    if($('#taskReport_optTable_wrapper').has("#runTimeofTasks_LineFlot").length <= 0){

        $('#taskReport_optTable_wrapper').prepend("<br/><br/>");
        $('#taskReport_optTable_wrapper').prepend(clicktoDrawRunTimeofTasks);
    }

    $('#runTimeofTasks_LineFlot').unbind().click(function(){ 
        funDrawLineFlot();
        showSaveBtn();//show save button
        $(".close").click();//close message box
    })

};



