/** by kristen
*
*
*/

/**
*JMeter threshold init
*/
var JMeterConcurrentUser = $("#concurrentUserNumberSlideBar").val();
var JMeterRampupTime = $("#rampupTimeSlideBar").val();
var JMeterIteration = $("#iterationSlideBar").val();
var JMeterDuration = $("#durationSlideBar").val();
var SeleniumScriptType = $("#scriptType").find(":selected").val();


$("#finishTestTaskBtnEdit").click(function(){
   if(checkTestTaskInfo()){
        updateTestTask_os();
    }
});

/**
 *Display testool and get Threshold valus of JMeter  
 *by Jacky
 */
$("#testtool").click(function() {
    if ($("#testtool").find(":selected").val() == 0) {
        JMeterThreshold.style.display = "";
        SeleniumThreshold.style.display = "none";
    }else if ($("#testtool").find(":selected").val() == 1) {
        JMeterThreshold.style.display = "none";
        SeleniumThreshold.style.display = "";
    } else {
        JMeterThreshold.style.display = "none";
        SeleniumThreshold.style.display = "none";
    }
});

function updateTestTask_os() {
    /*alert("AAsssdvsdfdfbdfdv444"+JSON.stringify(browser())+","+$("#testTaskname").val()
        +","+$("#teskForm").attr("action"));*/
    var url = $("#url").val();
    alert(url);
    os = 0;
    vm = checkVMnumber();
    alert($("#teskForm").attr("action"));
    /*$.post('http://www.google.com',{}, function(data,status){
        alert("Data: " + data + "\nStatus: " + status);
    });
    '/updateTestTask_os/56b59d2d14f44505cdcd6be7'*/
    $.post('/updateTestTask_os/56b59d2d14f44505cdcd6be7',{
        testTask_name: $("#testTaskname").val(),
        testTask_repo: $("#repositoryURL").val(),
        testTask_scriptPath: $("#scriptPath").val(),
        testTask_username: $("#username").val(),
        testTask_password: $("#password").val(),
        testTask_domainurl: $("#targetBaseURL").val(),      
        testTask_os : os, 
        testTask_vm : vm,
        testTask_testtool: $("#testtool").find(":selected").val(),
        testTask_browser:JSON.stringify(browser()),
        testTask_aaa : vm,
        Jmeterthreshod: JSON.stringify(calculateToolThreshold())
    }, function(data,status){
        alert("Data: " + data + "\nStatus: " + status);
    });
    $("#teskForm").attr("action", "/tasklist");
    
/*
        testTask_browser123:"{'browser':['C']}",
        $("#teskForm").attr("action", "/tasklist");*/
}

function calculateToolThreshold() {
   if ($("#testtool").find(":selected").val() == 0) {
        var ToolThreshold = {
            JMeterConcurrentUser: JMeterConcurrentUser,
            JMeterRampupTime: JMeterRampupTime,
            JMeterIteration: JMeterIteration,
            JMeterDuration: JMeterDuration,
            SeleniumScriptType: null,
        };
        return ToolThreshold;
    } else {                            //if testtool is Selenium, testscript values is null
       var ToolThreshold_null = {
            JMeterConcurrentUser: null,
            JMeterRampupTime: null,
            JMeterIteration: null,
            JMeterDuration: null,
            SeleniumScriptType: SeleniumScriptType,
        };
        return ToolThreshold_null;
    }
}
function browser() {
    var browserArr = [];
    if ($("#chrome").prop("checked")) {
        browserArr.push("CHROME");
    }
    if ($("#firefox").prop("checked")) {
        browserArr.push("FIREFOX");
    }
    
    var browserJsonStr = {browser:browserArr};
    return browserJsonStr;
}


/**
 *
 *105.01.29 get values of SlideBar
 *by Jacky
 *
 */
function getConcurrentUser() {

    var x = document.getElementById("concurrentUserNumberSlideBar");
    var y = document.getElementById("concurrentUserNumber");
    y.value = x.value;
    JMeterConcurrentUser = x.value;
    var z = document.getElementById("concurrentUserNumberTitle");
    z.value = "Number of Threads per Engine per each Available Thread Group: " + x.value;
}

function getRampupTime() {
    var x = document.getElementById("rampupTimeSlideBar");
    var y = document.getElementById("rampupTime");
    y.value = x.value;
    JMeterRampupTime = x.value;
    var z = document.getElementById("rampupTimeTitle");
    z.value = "Rampup period for each available thread group (in seconds): " + x.value;
}

function getIteration() {
    var x = document.getElementById("iterationSlideBar");
    var y = document.getElementById("iteration");
    y.value = x.value;
    JMeterIteration = x.value;
    var z = document.getElementById("iterationTitle");
    z.value = "Number of iterations for each available thread group: " + x.value;
}

function getDuration() {
    var x = document.getElementById("durationSlideBar");
    var y = document.getElementById("duration");
    y.value = x.value;
    JMeterDuration = x.value;
    var z = document.getElementById("durationTitle");
    z.value = "Duration for each available thread group: " + x.value + " minutes";
}
