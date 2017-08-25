function detailTask(taskID) {
    // css
    $('#infoContent').css({
        top: '100px',
        left: '-100px',
        margin: '0px',
        "min-height": '650px',
        width:'800px'
    });
    $('#infoContent').width(800);
    $('#infoContent').css("min-height","650px");
    $('#modal-body').css("min-height:650px");
    // content
    $('.modal-title').text("Task Detail");

    var descType = {};
    $.ajax({
        type: "POST",
        data: {
            "taskID": taskID
        },
        url: "/loadEditTaskForm",
        success: function(d) {
            // get descType
            var jobDescript = JSON.parse(d);

            jobDescript.forEach(function(element) {
                if(element.type == DESCRIPTOR_TYPE.PARENTDIV){
                    element.childs.forEach(function(element) {
                        descType[element.name] = element.type;
                    });
                }else{
                    descType[element.name] = element.type;
                }
            });

            // load the task information
            $.ajax({
                type: "POST",
                data: {
                    "taskID": taskID
                },
                url: "/getTaskInfo",
                success: function(d) {
                    var task = JSON.parse(d);
                    var html = '<table id="taskParmTable" class="table table-hover">';
                    html += '<thead><tr><th>Parameter</th><th>Value</th></tr></thead>';
                    html += '<tbody>';
                    
                    // task name
                    html += '<tr><td>Name</td><td>' + task.testtaskname + '</td></tr>';
                    // job type
                    html += '<tr><td>Job type</td><td>' + task.jobtype + '</td></tr>';
                    // task descriptors
                    var testscript = task.testscript
                    for (var key in testscript) {
                        var val = testscript[key];
                        var type = descType[key];

                        html += '<tr>';
                        switch (type) {
                            case 10: // NUMBER
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            case 11: // DECIMAL
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            case 20: // STRING
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            case 21: // PASSWORD
                                if(val == '' || val == null)
                                    html += '<td>' + key + '</td><td></td>';  // no password
                                else
                                    html += '<td>' + key + '</td><td>' + '********' + '</td>';  // hide password
                                break;
                            case 30: // OPTION
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            case 40: // URL
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            case 41: // PATH
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            case 42: // EMAIL
                                html += '<td>' + key + '</td><td>' + val + '</td>';
                                break;
                            default: // other
                                ; // do nothing
                        }
                        html += '</tr>';
                    }
                    html += '</tbody>';
                    html += '</table>';
                    document.getElementById("modal-body").innerHTML = html;
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
                }
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.readyState + '\n' + XMLHttpRequest.status + '\n' + XMLHttpRequest.responseText);
        }
    });
}
/**
 * Build log interface and show build history.
 * @param {String} the taskid
 */
function buildLogInterface(taskid){
    $('#infoContent').css({
        top: '100px',
        left: '-300px',
        margin: '0px',
        width: '1200px',
    });
    // display a loader before connection to back-end
    $("#modal-body").html('<table border="1" style="width:1100px;margin:auto;min-height:340px"><tr><td style="width: 150px;height: 40px;text-align: center;font-size: 18px;">Builds</td><td rowspan="2" id="build_log" style="vertical-align: top;padding:5px 15px 15px 0px;"></td></tr><tr><td style="vertical-align: top;" id="testtask_builds"><div class="mini_loader"></div></td></tr></table>');
    $('.modal-title').text("TestTask Log Info");

    getBuildHistory(taskid, function(err, builds){
        if(err){
            console.error(err);
        }else{
            //remove loader
            $("#testtask_builds").children('.mini_loader').remove();
            if(builds.length){
                // append div with each build
                $(builds).each(function(build){
                    build = builds[build];
                    var buildHTML;
                    // build number format: Build XXX
                    if(build.number == null){
                        buildHTML = '<div class="build" data-runnumber="'+ builds.length +'"><div style="height:30px"><div class="buildnumber">Build '+ builds.length +'</div><div class="';
                    }else{
                        buildHTML = '<div class="build" data-runnumber="'+ build.number +'"><div style="height:30px"><div class="buildnumber">Build '+ build.number +'</div><div class="';
                    }
                    // build status: green for success, red for failure, twinkled yellow for running
                    if(build.result == "SUCCESS"){
                        buildHTML += 'buildstatuslight success';
                    }else if(build.result == "FAILURE" || build.result == "ABORTED"){
                        buildHTML += 'buildstatuslight failure';
                    }else{
                        buildHTML += 'buildstatuslight running';
                    }
                    // build timestamp format: 20XX-XX-XX XX:XX
                    // timestamp has been processed at back-end
                    buildHTML += '"><div></div></div></div><div class="buildstarttime">' + build.timestamp;
                    // build duration format: xxh xxm xxs xx
                    if(build.result == "SUCCESS" || build.result == "FAILURE" || build.result == "ABORTED"){
                        buildHTML += '</div><div class="buildduration">' + toReadableDuration(build.duration) + '</div></div>';
                    }else if(build.number){
                        var currentDuration = toReadableDuration(new Date() - new Date(build.timestamp));
                        buildHTML += '</div><div class="buildduration">' + currentDuration.substring(0, currentDuration.length - 3) + '</div></div>';
                    }else{
                        buildHTML += '</div><div class="buildduration">Waiting..</div></div>';
                    }
                    $("#testtask_builds").append(buildHTML);
                });
                $($('.build')[0]).addClass('current');
                CheckStatusToGetJobLog(taskid);
                $('.build').click(function(){
                    // change the console log into the build user choose
                    if(!$(this).hasClass('current')){
                        $('.build.current').removeClass('current');
                        $(this).addClass('current');
                        if(this == $('.build')[0]){
                            $("#build_log").html('<div class="mini_loader"></div>');
                            clearInterval(myInterval);
                            // if the build is the newest, it is neccesary to check the status
                            // since sometimes the build status is not changed to "Ready" immediately
                            CheckStatusToGetJobLog(taskid);
                        }else{
                            $("#build_log").html('<div class="mini_loader"></div>');
                            clearInterval(myInterval);
                            // if the build is not the newest, get the job log immediately.
                            getJobLogInfo(taskid, 'Finished', $(this).data('runnumber'));
                        }
                    }
                });
                // if the test task is running, check the status of task every two seconds
                if($(".buildstatuslight.running").length){
                    var timerID, waitingID;
                    // if number is null,it means the status of build will be Waiting. If not null, it will be Running.
                    if(builds[0].number){
                        var intcurrentduration = new Date() - new Date(builds[0].timestamp) + 1000;
                        // this interval counts the duration of task at front-end
                        timerID = setInterval(function(){
                            var currentDuration = toReadableDuration(intcurrentduration);
                            intcurrentduration += 1000;
                            $(".buildstatuslight.running").parent().parent().children(".buildduration").html(currentDuration.substring(0, currentDuration.length - 3));
                        }, 1000);
                    }else{
                        // create time will refresh when status is changed from Waiting to Running.
                        // Therefore, we cannot start timer when status is Waiting.
                        // Current solution is to check build number every second and display "Waiting.." at duration field
                        // until build number is not null.
                        waitingID = setInterval(function(){
                            getLastBuildInfo(taskid, function(err, result){
                                if(result.number){
                                    clearInterval(waitingID);
                                    var intcurrentduration = new Date() - new Date(result.timestamp);
                                    var currentDuration = toReadableDuration(intcurrentduration);
                                    intcurrentduration += 1000;
                                    $(".buildstatuslight.running").parent().parent().children(".buildduration").html(currentDuration.substring(0, currentDuration.length - 3));
                                    // this interval counts the duration of task at front-end
                                    timerID = setInterval(function(){
                                        currentDuration = toReadableDuration(intcurrentduration);
                                        intcurrentduration += 1000;
                                        $(".buildstatuslight.running").parent().parent().children(".buildduration").html(currentDuration.substring(0, currentDuration.length - 3));
                                    }, 1000);
                                }
                            });
                        }, 1000);
                    }

                    // this interval get information of last build from back-end to check whether it finishes or not.
                    var buildStatusLightIntervalID = setInterval(function(){
                        checkRunStatus(taskid, function(err, status){
                            if(status == "SUCCESS"){
                                clearInterval(waitingID);
                                clearInterval(timerID);
                                var durationdiv = $(".buildstatuslight.running").parent().parent().children(".buildduration");
                                // Because jenkins doesn't provide duration right after that task finishes, so
                                // check duration every three seconds to get the correct duration.
                                setTimeout(function(){
                                    refreshduration(taskid, durationdiv);
                                }, 3000);
                                $(".buildstatuslight.running").removeClass('running').addClass('success');
                                clearInterval(buildStatusLightIntervalID);
                            }else if(status == "FAILURE"){
                                clearInterval(waitingID);
                                clearInterval(timerID);
                                var durationdiv = $(".buildstatuslight.running").parent().parent().children(".buildduration");
                                setTimeout(function(){
                                    refreshduration(taskid, durationdiv);
                                }, 3000);
                                $(".buildstatuslight.running").removeClass('running').addClass('failure');
                                clearInterval(buildStatusLightIntervalID);
                            }
                        });
                    }, 1000);
                    $("#infoModal").on('hide.bs.modal', function(){
                        clearInterval(waitingID);
                        clearInterval(timerID);
                        clearInterval(buildStatusLightIntervalID);
                    });
                }
                $("#testtask_builds").append('<div id="build_count" style="text-align: center;color: gray;font-size: 12px;">'+ 
                    builds.length +' of '+ builds.length +'</div>');
            }else{
                // if the test task hasn't been triggered, display warnning message
                $("#testtask_builds").html('<div id="build_count" style="text-align: center;color: gray;font-size: 12px;">0 of 0</div>');
                $("#build_log").html('<div style="text-align:center; margin-top:10px">No run to show.</div>');
            }
        }
    });
}
/**
 * get Build history by taskid
 * Process in asynchronous to avoid from web page stuck
 * @param {String} the taskid
 */
function getBuildHistory(taskid, callback){
    $.ajax({
        type: "POST",
        data: {
            TaskId: taskid
        },
        url: "/getInfomationOfBuildHistory",
        success: function(result) {
            callback(null, result);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            callback(new Error("getBuildHistory error "+ textStatus));
        }
    });
}

/**
 * Trigger function of getting job log after checkout the status of jenkinsjob
 * @param {String} the taskid
 */

function CheckStatusToGetJobLog(taskid) {
    checkRunStatus(taskid, function(err, status){
        switch (status) {
            case 'Ready':
                $('#build_log').text("No run to show.");
                break;

            case 'Waiting':
                $("#build_log").html('<div style="text-align:center; margin-top:10px">Please wait for a second.</div>');
                myInterval = setInterval(function(){
                    clearInterval(myInterval);
                    CheckStatusToGetJobLog(taskid);
                }, 1000);
                break;

            case 'Running':
                getJobLogInfo(taskid,'Running');
                break;

            default:
                getJobLogInfo(taskid, 'default')
                clearInterval(myInterval);
        }
    });
}

function getJobLogInfo(taskid, status, runnumber) {
    $('#infoContent').css({
        top: '100px',
        left: '-300px',
        margin: '0px'
    });

    $('#infoContent').width(1200);

    log = getJobLogToSetInterval(taskid, runnumber);
    var text = log.replace(/((<tr>.+?<\/tr>){8})[\s\S]*/, '$1</table>');
    // if the amount of lines of the text is less than eight, print complete log
    // if not, print partial log and a button allows user to view complete log 
    if(log.length > text.length){
        $("#build_log").html(text.substring(0, text.length-8) + '<tr><td></td><td>...........<a href="#" class="read-more">Read more</a></td></tr></table>');
        initializeLog();
        $("a.read-more").click(function() {
            $("a.read-more").unbind("click");
            if (status == 'Running') {
                myInterval = setInterval(function() {
                    log = getJobLogToSetInterval(taskid, runnumber);
                    $("#build_log").html(log);
                    initializeLog();
                    checkRunStatus(taskid, function(err, status){
                        if(status != "Running"){
                            setClearInterval();
                        }
                    });
                }, 1300);
                $("#infoModal").on('hide.bs.modal', function(){
                    setClearInterval();
                    $("#infoModal").unbind('hide');
                });
            }else{
                log = getJobLogToSetInterval(taskid, runnumber);
                $("#build_log").html(log);
                initializeLog();
            }
        });  
    }else{
        $("#build_log").html(text);
        initializeLog();
        if (status == 'Running') {
            setTimeout(function() {
                getJobLogInfo(taskid, status, runnumber);
            }, 1000);
        }
    }
}



var myInterval;

function setClearInterval() {
    clearInterval(myInterval);
}


/**
 * Get status of job from jenkins
 * @param {String} the taskid
 * @param {fn} callback receives the status of Job:
 *   <ul>
 *     <li>data_status: job status</li>
 *   </ul>
 * @private
 */
function checkRunStatus(taskid, callback) {
    $.ajax({
        type: "POST",
        data: {
            TaskId: taskid
        },
        url: "/statusOfTasks",
        success: function(status) {
            callback(null, status);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            callback(new Error("checkRunStatus error "+ textStatus));
        }
    });
}

/**
 * Get job log from Jenkins
 * @param {String} the taskid
 * @param {fn} callback receives the log of Job:
 *   <ul>
 *     <li>log: Jenkins Run log</li>
 *   </ul>
 * @private
 */
 
function getJobLogToSetInterval(taskid, runnumber) {
    $.ajax({
        type: "POST",
        url: "/getJenkinsJobLogById",
        data: {
            TaskId: taskid,
            RunNumber: runnumber
        },
        async: false,
        success: function(result) {
            log = result;

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("getJobLog error");
        }
    });
    return log;
}
/*
 * Get infomation of the last build of the task which matches the task id
 */
function getLastBuildInfo(taskid, callback){
    $.ajax({
        type: "POST",
        url: "/getLastBuildInfo",
        data: {
            TaskId: taskid
        },
        async: false,
        success: function(result) {
            callback(null, result[0]);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("getJobLog error");
        }
    });
}

/*
 * convert timestamp duration into readable format
 * format: xxh xxm xxs xx
 */
function toReadableDuration(duration){
    var result = "";
    var sec = Math.floor(duration / 1000);
    var min = Math.floor(sec / 60);
    sec = sec % 60;
    var hour = Math.floor(min / 60);
    min = min % 60;
    if(hour){
        result += hour.toString() + 'h ';
    }
    if(min){
        result += min.toString() + 'm ';
    }
    result += sec.toString() + 's ';
    ms10 = Math.round(duration % 1000 / 10);
    if(ms10 < 10){
        result += '0';
    }
    result += ms10.toString();
    return result;
}
/*
 * recursively check duration every three seconds.
 */
function refreshduration(taskid, durationdiv){
    getLastBuildInfo(taskid, function(err, result){
        if(result.duration)
            durationdiv.html(toReadableDuration(result.duration));
        else{
            setTimeout(function(){
                refreshduration(taskid, durationdiv);
            }, 3000);
        }
    });
}
