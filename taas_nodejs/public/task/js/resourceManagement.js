/*
 *  fix the message on the modal to ask user if user want to delete instance
 */
function askDelInstance(instanceName, instanceId, projID){
	$('#yesnoContent').css({
		top: '150px',
		left: '0px',
		margin: '0px'
	});
	$('#modal-title').text("Delete Instance");
	$('#modal-context').text("Do you want to remove Instance　\"" + instanceName + "\"　?");
	$('#yesBtn').attr("onclick", "delInstance('" + instanceId + "','"+ projID +"')");
	$('#yesBtn').attr("style","background-color: #F6434E;border-color: #F6434E;");
	$('#yesBtn').text("Yes, delete this instance");
}
/*
 *  send request to resource management node to delete instance through backend server.
 */
function delInstance(instanceId, projID){
	$.ajax({
        type: "POST",
        url: "/deleteInstance",
        data: {
            instanceid: instanceId
        },
        success: function(result) {
            if(result == "Connection timeout"){
                delInstance(instanceId, projID);
            }else{
                refreshStackStatusNow(projID);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("get Stack error");
        }
    });
}
/*
 *  fix the message on the modal to ask user if user want to rebuild instance
 */
function askRebuildInstance(instanceName, instanceId, projID){
	$('#yesnoContent').css({
		top: '150px',
		left: '0px',
		margin: '0px'
	});
	$('#modal-title').text("Rebuild Instance");
	$('#modal-context').text("Do you want to rebuild Instance　\"" + instanceName + "\"　?");
	$('#yesBtn').attr("onclick", "rebuildInstance('" + instanceId + "','"+ projID +"')");
	$('#yesBtn').attr("style","background-color: #2780e3;border-color: #2780e3;");
	$('#yesBtn').text("Yes, rebuild this instance");
}
/*
 *  send request to resource management node to rebuild instance through backend server.
 */
function rebuildInstance(instanceId, projID){
	$.ajax({
        type: "POST",
        url: "/rebuildInstance",
        data: {
            instanceid: instanceId
        },
        success: function(result) {
            if(result == "Connection timeout"){
                rebuildInstance(instanceId, projID);
            }else{
                refreshStackStatusNow(projID);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("rebuild error");
            window.location.assign('/');
        }
    });
}
/*
 *  fix the message on the modal to ask user if user want to reboot instance
 */
function askRebootInstance(instanceName, instanceId, projID){
	$('#yesnoContent').css({
		top: '150px',
		left: '0px',
		margin: '0px'
	});
	$('#modal-title').text("Reboot Instance");
	$('#modal-context').text("Do you want to reboot Instance　\"" + instanceName + "\"　?");
	$('#yesBtn').attr("onclick", "rebootInstance('" + instanceId + "','"+ projID +"')");
	$('#yesBtn').attr("style","background-color: #2780e3;border-color: #2780e3;");
	$('#yesBtn').text("Yes, reboot this instance");
}
/*
 *  send request to resource management node to reboot instance through backend server.
 */
function rebootInstance(instanceId, projID){
	$.ajax({
        type: "POST",
        url: "/rebootInstance",
        data: {
            instanceid: instanceId
        },
        success: function(result) {
            if(result == "Connection timeout"){
                rebootInstance(instanceId, projID);
            }else{
                if($("#infoModal2").hasClass('in')){
                    $("#infoModal2").modal('hide');
                }
                refreshStackStatusNow(projID);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("reboot error");
            window.location.assign('/');        
        }
    });
}
/*
 *  ask user if he/she really wants to hard reboot this instance or not
 */
function askHardRebootInstance(instanceName, instanceId, projID){
    $('#yesnoContent').css({
        top: '150px',
        left: '0px',
        margin: '0px'
    });
    $('#modal-title').text("Hard Reboot Instance");
    $('#modal-context').text("Do you want to hard reboot Instance　\"" + instanceName + "\"　?");
    $('#yesBtn').attr("onclick", "hardRebootInstance('" + instanceId + "','"+ projID +"')");
    $('#yesBtn').attr("style","background-color: #2780e3;border-color: #2780e3;");
    $('#yesBtn').text("Yes, reboot this instance");
}
/*
 *  send request to resource management node to hard reboot instance through backend server. 
 */
function hardRebootInstance(instanceId, projID){
    $.ajax({
        type: "POST",
        url: "/hardRebootInstance",
        data: {
            instanceid: instanceId
        },
        success: function(result) {
            if(result == "Connection timeout"){
                rebootInstance(instanceId, projID);
            }else{
                if($("#infoModal2").hasClass('in')){
                    $("#infoModal2").modal('hide');
                }
                refreshStackStatusNow(projID);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("reboot error");
            window.location.assign('/');        
        }
    });
}
/*
 *  change the target modal with loading icon and loading message and run callback after modal is shown
 */
function loader(modal, callback){
    modal.find(".modal-content").attr('style', '');
    modal.find(".modal-content").css({
        top: '100px',
        left: '150px',
        margin: '0px'
    });
    modal.find(".modal-content").width(300);
    modal.find('.modal-header').css('display','none');
    modal.find('.modal-footer').css('display','none');
    modal.find(".modal-body").attr('style','padding:40px 0px 40px 0px');
    modal.find('.modal-body').html('<div class="loader"><div class="spinloader"><svg fill="#94DDFF" viewBox="0 0 100 100" width="50" height="50"><path d="M97.6,55.7V44.3l-13.6-2.9c-0.8-3.3-2.1-6.4-3.9-9.3l7.6-11.7l-8-8L67.9,20c-2.9-1.7-6-3.1-9.3-3.9L55.7,2.4H44.3l-2.9,13.6      c-3.3,0.8-6.4,2.1-9.3,3.9l-11.7-7.6l-8,8L20,32.1c-1.7,2.9-3.1,6-3.9,9.3L2.4,44.3v11.4l13.6,2.9c0.8,3.3,2.1,6.4,3.9,9.3      l-7.6,11.7l8,8L32.1,80c2.9,1.7,6,3.1,9.3,3.9l2.9,13.6h11.4l2.9-13.6c3.3-0.8,6.4-2.1,9.3-3.9l11.7,7.6l8-8L80,67.9 c1.7-2.9,3.1-6,3.9-9.3L97.6,55.7z M50,65.6c-8.7,0-15.6-7-15.6-15.6s7-15.6,15.6-15.6s15.6,7,15.6,15.6S58.7,65.6,50,65.6z"></path></svg></div><svg class="loaderfilter" viewBox="0 0 100 100" width="50" height="50" style="opacity:0.4"><circle cx="70" cy="70" r="70" fill="transparent" stroke="white" stroke-width="40" ></circle></svg></div><div class="loadermessage"></div>');
    if(callback){
        modal.on('shown.bs.modal', function(){
            callback();
            modal.unbind('shown');
        });
    }
}
/*
 *  change the target modal to show stack information with arg stacks
 */
function setStackStatus(stacks, projID){
    $("#infoModal").find(".modal-content").css({
        top: '100px',
        left: '-300px',
        margin: '0px',
        width: '1200px'
    });
    $("#infoModal").find(".modal-body").attr('style','');
    $("#infoModal").find(".modal-title").text("Instance Status");
    $("#infoModal").find(".modal-header").css('display', 'block');
    $("#infoModal").find(".modal-footer").css('display', 'block');
    var stacksHtml = '<table id="stacktable" class="table table-hover"><thead><th>Vm Spec</th><th>Image Name</th><th>Public IP</th><th>Private IP</th><th>Flavor</th><th>Keypair</th><th>Create Time</th><th>Status</th><th>Command</th></thead><tbody>';
    var messageHtml = '<div style="padding-top:10px;text-align:center;line-height:30px">';
    $.each(stacks, function(index, stack){
        if(!stack.hasOwnProperty("stack_status")){
            return;
        }

        if(stack.stack_status == "UPDATE_IN_PROGRESS"){
            messageHtml += '<div style="color: brown">' + 'updating ' + stack.vm_spec_name + '...</div>';
        }else if(stack.stack_status == "CREATE_IN_PROGRESS"){
            messageHtml += '<div style="color: green">' + 'creating ' + stack.vm_spec_name + '...</div>';
        }else if(stack.stack_status == "DELETE_IN_PROGRESS"){
            messageHtml += '<div style="color: red">' + 'deleting ' + stack.vm_spec_name + '...</div>';
        }else if(stack.stack_status.search("FAILED") != -1){
            stack.failed_events.forEach(function(event){
                messageHtml += '<div style="color: red">' + stack.vm_spec_name + ' is ' + stack.stack_status + '<br>' + event.resource_status_reason + '</div>';
            });
        }else if (stack.stack_status == "CREATE_COMPLETE" || stack.stack_status == "UPDATE_COMPLETE"){
            $.each(stack.instances, function(index, instance){
                stacksHtml += '<tr>';
                stacksHtml += '<td>' + stack.vm_spec_name + '_' + (index+1) + '</td>';
                stacksHtml += '<td>' + instance.image + '</td>';
                stacksHtml += '<td>' + stack.public_ips[index] + '</td>';
                stacksHtml += '<td>' + stack.private_ips[index] + '</td>';
                stacksHtml += '<td>' + stack.flavor + '</td>';
                stacksHtml += '<td>' + stack.keypair + '</td>';
                stacksHtml += '<td>' + instance.create_time + '</td>';
                if(instance.status == "SHUTOFF"){
                    stacksHtml += '<td style="color:red">ShutDown</td>';
                }else if(instance.status == "ACTIVE"){
                    stacksHtml += '<td style="color:green">Running</td>';
                }else if(instance.status == "REBOOT"){
                    stacksHtml += '<td style="color:orange">Rebooting...</td>';
                }else if(instance.status == "HARD_REBOOT"){
                    stacksHtml += '<td style="color:darkred">Hard Rebooting...</td>';
                }else if(instance.status == "REBUILD"){
                    stacksHtml += '<td style="color:brown">Rebuilding...</td>';
                }else if(instance.status == "DELETING"){
                    stacksHtml += '<td style="color:red">Deleting...</td>';
                }else if(instance.status == "DELETED"){
                    stacksHtml += '<td style="color:red">Deleted</td>';
                }else if(instance.status == "ERROR"){
                    stacksHtml += '<td style="color:red">Error</td>';
                }else{
                    stacksHtml += '<td>' + instance.status + '</td>';
                }
                stacksHtml += '<td><div style="right: -4px;margin-top: -2px;" class="hover-btn">';
                stacksHtml += '<a title="Soft reboot"><img class="instanceRebootButton" onclick="askRebootInstance(\''+ stack.vm_spec_name + '_' + (index+1) +'\',\''+ instance.id +'\',\''+ projID +'\')" data-toggle="modal" data-target="#yesnoModal" style="width:25px" src="/images/reboot.png"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                stacksHtml += '<a title="Hard reboot"><img class="instanceHardRebootButton" onclick="askHardRebootInstance(\''+ stack.vm_spec_name + '_' + (index+1) +'\',\''+ instance.id +'\',\''+ projID +'\')" data-toggle="modal" data-target="#yesnoModal" style="width:25px" src="/images/hard reboot.png"></a></div></td>';
            });
        }
    });

    stacksHtml += '</tbody></table>';
    messageHtml += '</div>';
    $('#modal-body').html(stacksHtml + messageHtml);

    $(".instanceRebootButton").mouseenter(function(){$('body').css("cursor", "pointer")}).mouseleave(function(){$('body').css("cursor", "default")});
    $(".instanceHardRebootButton").mouseenter(function(){$('body').css("cursor", "pointer")}).mouseleave(function(){$('body').css("cursor", "default")});

    var stacksDataTable = $("#stacktable").DataTable({
        "autoWidth": false,
        "info": false,
        "searching": false,
        "paging": false,
        "order": [
            [1, 'asc'], [0, 'asc']
        ],
        "columns":[
            {'width': '13%'},
            {'width': '12%'},
            {'width': '10%'},
            {'width': '10%'},
            {'width': '10%'},
            {'width': '10%'},
            {'width': '15%'},
            {'width': '14%'},
            {'orderable': false ,'width': '10%'}
        ]
    });
}
/*
 *  send request to rsc_mgmt to get stack information now
 */
function refreshStackStatusNow(projID){
    if($("#infoModal").hasClass('in') && $("#stacktable").length){
        getStackInfo(projID, function(err, stacks){
            if(err){
                refreshStackStatusNow(projID);
            }else{
                if($("#infoModal").hasClass('in') && $("#stacktable").length){
                    setStackStatus(stacks, projID);
                }
            }
        });
    }
}
/*
 *  send request to rsc_mgmt to get stack information now and fix loading message
 */
function refreshStackStatus(projID){
    if($("#infoModal").hasClass('in')){
        getStackInfo(projID, function(err, stacks){
            if($("#infoModal").hasClass('in')){
                if(err){
                    $("#infoModal").find('.loadermessage').html('<span style="color:red">Connection Timeout</span><br>Retry Loading..');
                    refreshStackStatus(projID);
                }else{
                    setStackStatus(stacks, projID);
                    setTimeout(function(){
                        refreshStackStatusInterval(projID, 20);
                    }, 20000);
                }
            }
        });
    }
}
/*
 *  send request to rsc_mgmt to get stack information and wait for seconds for next request
 */
function refreshStackStatusInterval(projID, second){
    if($("#infoModal").hasClass('in') && $("#stacktable").length){
        getStackInfo(projID, function(err, stacks){
            if(err){
                console.log(err);
                refreshStackStatusInterval(projID, second);
            }else{
                if($("#infoModal").hasClass('in') && $("#stacktable").length){
                    setStackStatus(stacks, projID);
                    setTimeout(function(){
                        refreshStackStatusInterval(projID, second);
                    }, second * 1000);
                }
            }
        });
    }
}
/*
 *  send request to rsc_mgmt to get stack information
 */
function getStackInfo(projID, callback){
    $.ajax({
        type: "POST",
        url: "/getStackInfo",
        data: {
            projID: projID
        },
        timeout:30000,
        success: function(result) {
            if(result == 'Connection timeout'){
                callback(new Error(result));
            }else{
                console.log(result);
                callback(null, result);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if(XMLHttpRequest.readyState == 4){
                alert("get Stack error");
            }
            if(XMLHttpRequest.readyState == 0 && XMLHttpRequest.statusText == "timeout"){
                callback(new Error('Connection timeout'));
            }
        }
    });
}
