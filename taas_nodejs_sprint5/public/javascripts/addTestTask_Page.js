var JMeterConcurrentUser = $("#concurrentUserNumber").val(); // JMeterConcurrentUser init
var JMeterRampupTime = $("#rampupTime").val();
var JMeterIteration = $("#iteration").val();
var JMeterDuration = $("#duration").val();
var SeleniumScriptType = $("#scriptType").find(":selected").val();

$("#finishTestTaskBtn").click(function() {
    if (checkTestTaskInfo() && checkTaskNameExist() ==true) {
        addTestTask();
    }
});

$("#finishTestTaskBtnEdit").click(function() {
    if (checkTestTaskInfo() && checkTaskNameExist() ==true) {
        updateTestTask();
    } 
});

/**
 *Change test tool  
 *by Emily
 */
$("#testtool").click(function() {
    if ($("#testtool").find(":selected").val() == 0) {
        JMeterThreshold.style.display = "";
        SeleniumThreshold.style.display = "none";
    } else if ($("#testtool").find(":selected").val() == 1) {
        JMeterThreshold.style.display = "none";
        SeleniumThreshold.style.display = "";
    } else {
        JMeterThreshold.style.display = "none";
        SeleniumThreshold.style.display = "none";
    }
});

/**
 *Display script type for Selenium  
 *by Emily
 */
$("#scriptType").click(function() {
    if ($("#scriptType").find(":selected").val() == 0) {
        SeleniumScriptType = 0;
    } else {
        SeleniumScriptType = 1;
    }
});

/**
 *trigger the function when user key thetaskname
 *2016.02.26  
 *by Jacky
 */
var typingTimer;
$("#testTaskname").keyup(function() {
    typingTimer = setTimeout(checkTaskNameExist, 1000);
});

$("#testTaskname").keydown(function() {
    clearTimeout(typingTimer);
});

/**
 *Check the input of taskname already exists
 *2016.02.26  
 *by Jacky
 */
function checkTaskNameExist() {

    $.ajax({
        type: "POST",
        url: "/checkTaskNameExist",
        data: {
            taskName: $("#testTaskname").val(),
           taskId: $("#TaskID").val()
        },
        async: false,
        success: function(result) {

            if (result == "exist") {
                console.log("exist");
                $("#testTasknameDiv").addClass("form-group has-error");
                $("#testTaskname").focus();
                $("#TaskNameMsg").text("Error, TaskName already Exists");
                return false;
            } else if (result == "Value is null") {
                console.log("Value is null");
                $("#TaskNameMsg").text("Error, TaskName is null");
                $("#testTasknameDiv").addClass("form-group has-error");
                $("#testTaskname").focus();
                return false;
            } else if (result == "ok") {
                console.log("ok");
                $("#TaskNameMsg").text("");
                $("#testTasknameDiv").removeClass("form-group has-error");
                $("#testTasknameDiv").addClass("form-group");
                return true;
            } else if (result == "same with _id") {
                $("#TaskNameMsg").text("");
                $("#testTasknameDiv").removeClass("form-group has-error");
                $("#testTasknameDiv").addClass("form-group");
                return true;
            } else {
                console.log('true');
                $("#TaskNameMsg").text("");
                $("#testTasknameDiv").removeClass("form-group has-error");
                $("#testTasknameDiv").addClass("form-group");
                return true;
            }
        },

    })

    if ($("#TaskNameMsg").text() == "") {
        return true
    }
    return false

}
/**
 *Insert test task
 *by Emily
 */
function addTestTask() {
    os = 0;
    vm = checkVMnumber();

    $.ajax({
        type: "POST",
        url: "/addTesttask",
        data: {
            testTask_name: $("#testTaskname").val(),
            testTask_repo: $("#repositoryURL").val(),
            testTask_scriptPath: $("#scriptPath").val(),
            testTask_username: $("#username").val(),
            testTask_password: $("#password").val(),
            testTask_domainurl: $("#targetBaseURL").val(),
            testTask_os: os,
            testTask_vm: vm,
            testTask_testtool: $("#testtool").find(":selected").val(),
            testTask_browser: JSON.stringify(browser()),
            testTask_threshod: JSON.stringify(calculateToolThreshold())
        },
        async: false,
        success: function(d) {},
        error: function() {
            alert("error");
        }
    });
    location.href = 'tasklistByProjID/' + $("#projid").val();
}

/**
 *Update test task
 *by Emily
 */
function updateTestTask() {
    os = 0;
    vm = checkVMnumber();
    $.ajax({
        type: "POST",
        url: $("#teskForm").attr("action"),
        data: {
            testTask_name: $("#testTaskname").val(),
            testTask_repo: $("#repositoryURL").val(),
            testTask_scriptPath: $("#scriptPath").val(),
            testTask_username: $("#username").val(),
            testTask_password: $("#password").val(),
            testTask_domainurl: $("#targetBaseURL").val(),
            testTask_os: os,
            testTask_vm: vm,
            testTask_testtool: $("#testtool").find(":selected").val(),
            testTask_browser: JSON.stringify(browser()),
            testTask_threshod: JSON.stringify(calculateToolThreshold())
        },
        async: false,
        success: function(d) {},
        error: function() {
            alert("error");
        }
    });
    location.href = '/tasklist';
}
/**
 *
 *105.01.28 Check TestTask input valuse is null
 *by Jacky
 *
 */
function setFocuse() {
    if ($("#testTaskname").val() == "") {
        $("#testTaskname").focus();
    } else if ($("#repositoryURL").val() == "") {
        $("#repositoryURL").focus();
    } else if ($("#testtool").val() == "null") {
        $("#testtool").focus();
    }
}

/**
 *Check test task fields
 *by Emily
 */
function checkTestTaskInfo() {
    //alert($("#testTaskname").val());
    $("#testTasknameDiv").removeClass("form-group has-error");
    $("#repositoryURLDiv").removeClass("form-group has-error");
    $("#scriptPathDiv").removeClass("form-group has-error");
    $("#domainUrlDiv").removeClass("form-group has-error");
    $("#testtoolDiv").removeClass("form-group has-error");
    $("#scriptTypeDiv").removeClass("form-group has-error");
    $("#testTasknameDiv").addClass("form-group");
    $("#repositoryURLDiv").addClass("form-group");
    $("#scriptPathDiv").addClass("form-group");
    $("#domainUrlDiv").addClass("form-group");
    $("#testtoolDiv").addClass("form-group");
    $("#scriptTypeDiv").addClass("form-group");
    if ($("#testTaskname").val() == "") {
        $("#testTasknameDiv").addClass("form-group has-error");
        $("#testTaskname").focus();
        return false;
    } else if ($("#repositoryURL").val() == "" ||
        !checkURL($("#repositoryURL").val())) {
        $("#repositoryURLDiv").addClass("form-group has-error");
        //alert("Error 'Repository URL' is not defined ! ");
        $("#repositoryURL").focus();
        return false;
    } else if ($("#scriptPath").val() == "") {
        //alert("Error 'Script Path' is not defined ! ");        
        $("#scriptPathDiv").addClass("form-group has-error");
        $("#scriptPath").focus();
        return false;
    } else if ($("#scriptType").val() == 0 && ( // only check targetBaseURL when script type is HTML
            $("#targetBaseURL").val() == "" ||
            !checkURL($("#targetBaseURL").val()))) {
        //alert("Error 'Domain URL' is not defined ! ");        
        $("#targetBaseURLDiv").addClass("form-group has-error");
        $("#targetBaseURL").focus();
        return false;
    } else if ($("#testtool").val() == "null") {
        $("#testtoolDiv").addClass("form-group has-error");
        $("#testtool").focus();
        return false;
    } else if ($("#testtool").val() == "1" && $("#scriptType").find(":selected").val() == "null") {
        $("#scriptTypeDiv").addClass("form-group has-error");
        $("#scriptType").focus();
        return false;
    } else {
        return true;

    }

}

/**
 *
 *105.01.28 Get JMeter Threshold valuse into var ToolThreshold
 *by Jacky
 *
 */
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
    } else { //if testtool is Selenium, testscript values is null
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

/**
 *Generate browser format to server
 *by Emily
 */
function browser() {
    var browserArr = [];
    if ($("#chrome").prop("checked")) {
        browserArr.push("CHROME");
    }
    if ($("#firefox").prop("checked")) {
        browserArr.push("FIREFOX");
    }
    if ($("#chrome").prop("checked") == false &&
        $("#firefox").prop("checked") == false) {
        browserArr.push("FIREFOX");
    }

    var browserJsonStr = {
        browser: browserArr
    };
    return browserJsonStr;
}

function checkTestTool() {
    testtool = $("#testtool").find(":selected").val();
    return testtool;
}

function checkVMnumber() {
    vm_choise = $("#vm_number").find(":selected").val();
    return vm_choise;

}

/**
 *get ConcurrentUserNumber
 *by Emily
 */
function getConcurrentUser() {
    //ConcurrentUser = $("#concurrentUserNumberSlideBar").val();

    var x = document.getElementById("concurrentUserNumberSlideBar");
    var y = document.getElementById("concurrentUserNumber");
    y.value = x.value;
    JMeterConcurrentUser = x.value;
    var z = document.getElementById("concurrentUserNumberTitle");
    z.value = "Number of Threads per Engine per each Available Thread Group: " + x.value;
}

/**
 *get RampupTime
 *by Emily
 */
function getRampupTime() {
    var x = document.getElementById("rampupTimeSlideBar");
    var y = document.getElementById("rampupTime");
    y.value = x.value;
    JMeterRampupTime = x.value;
    var z = document.getElementById("rampupTimeTitle");
    z.value = "Rampup period for each available thread group (in seconds): " + x.value;
}

/**
 *get Iteration
 *by Emily
 */
function getIteration() {
    var x = document.getElementById("iterationSlideBar");
    var y = document.getElementById("iteration");
    y.value = x.value;
    JMeterIteration = x.value;
    var z = document.getElementById("iterationTitle");
    z.value = "Number of iterations for each available thread group: " + x.value;
}

/**
 *get Duration
 *by Emily
 */
function getDuration() {
    var x = document.getElementById("durationSlideBar");
    var y = document.getElementById("duration");
    y.value = x.value;
    JMeterDuration = x.value;
    var z = document.getElementById("durationTitle");
    z.value = "Duration for each available thread group: " + x.value + " minutes";
}

/**
 *
 *105.02.18 check the format of the URL is legal or not
 *by Urostigma
 *
 */
function checkURL(url) {
    legal1 = url.match(/http:\/\/.+/);
    legal2 = url.match(/https:\/\/.+/);
    if (legal1 == null && legal2 == null) {
        // illegal url
        return false;
    } else {
        // legal url
        return true;
    }
}