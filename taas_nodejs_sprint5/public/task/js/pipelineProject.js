var currProj = null;  // current pipeline project name to view
var currRun = null;   // current run to view
var currTask = null;  // current task name to view
var rawLog = '';      // raw log in text
var parsedLog = null; // parsed log object
var refreshNeeded = true;
var consoleElementCnt = 0;  // the next console element id


// For IE compatibility
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
}


function _procResult(run) {
    function setStyle(txt, style) {
        return '<span class=' + style + '>' + txt + '</span>';
    }

    if (run.result === 'SUCCESS') {
        return setStyle('PASSED', 'successfully');
    }
    else if (run.result === 'FAILURE') {
        return setStyle('FAILED', 'failed');
    }
    else if (run.result === 'UNSTABLE') {
        return 'UNSTABLE';
    }
    else if (run.result === 'ABORTED') {
        return 'ABORTED';
    }
    else if (run.inQueue) {
        return 'WAITING';
    }
    else {
        return 'RUNNING';
    }
}

function _moveToRunInfoPage(pid, rid) {
    window.location = '/project/' + pid + '/run/' + rid;
}

function _buildRunRowHtml(pid, rid, run) {
    let row_elms = [
        run.number ? '#' + run.number : '',
        _procResult(run),
        run.relTime,
        run.durationStr,
        ''
    ];

    let row_html = '<tr onclick="_moveToRunInfoPage({{pid}},{{rid}})"><td>' + row_elms.join('</td><td>') + '</td></tr>';
    return row_html.replace('{{pid}}', "'" + pid + "'").replace('{{rid}}', rid);
}

function updateRunHistory() {
    let pid = decodeURIComponent(window.location).split('/').pop();
    $.get('/project/' + pid + '/runs/api')
        .done(function (data) {
            console.log(data);
            let tbody = $('#table_recent_runs').children('tbody');
            tbody.html('');
            for (let data_idx in data) {
                let run = data[data_idx];
                let row_html = _buildRunRowHtml(pid, run.number, run);
                tbody.append(row_html);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });

}

function runPipeline() {
    let pid = decodeURIComponent(window.location).split('/').pop();
    $.get('/project/' + pid + '/trigger/api')
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
}

function updateRunInfo() {
    let urlParms = decodeURIComponent(window.location).split('/');
    let rid = urlParms.pop();
    urlParms.pop();
    let pid = urlParms.pop();

    if (pid !== currProj || rid !== currRun) {
        currProj = pid;
        currRun = rid;
        currTask = null;
        refreshNeeded = true;
    }

    if (!refreshNeeded) return;

    $.get('/project/' + pid + '/run/' + rid + '/api')
        .done(function(runInfo) {
            console.log(runInfo);
            $('#run-info').html(
                '<span style="font-size:32px;" id="run-title">' +
                '#' + rid + ' ' + _procResult(runInfo) + '</span>' +
                (runInfo.timestamp? '<span style="padding-left:18px;">run time: ' + runInfo.relTime  + '</span>' : '') +
                (runInfo.duration? '<span style="padding-left:18px;">duration: ' + runInfo.durationStr + '</span>' : '')
            );
            if (runInfo.duration && runInfo.duration > 0) {
                refreshNeeded = false;
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    $.get('/project/' + pid + '/run/' + rid + '/log/start/' + '0' + '/api')
        .done(function(runLog) {
            console.log(runLog);
            rawLog = runLog.log;
            parseRawLog();
            updateTaskList();
            $('#log-panel').html('Select a task to show console logs.');
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
}

function parseRawLog() {
    if (!rawLog) {
        parsedLog = null;
        return;
    }

    function _addChild(newEntry) {
        currEntry.children.push(newEntry);
        logEntries.push(currEntry);
        currEntry = newEntry;
    }

    let rootEntry = {type: 'root', children: []};
    let currEntry = {type: 'block', children: []};  // current log entry during parsing
    rootEntry.children.push(currEntry);
    let logEntries = [rootEntry];  // active log entries during parsing
    parsedLog = rootEntry;

    let lines = rawLog.split('\n');
    for (let lineIdx in lines) {
        let line = lines[lineIdx];
        if (line.startsWith('[Pipeline] ')) {
            line = line.substr(11); // trim the beginning '[Pipeline] '
            if (line.startsWith('//')) {
                // do nothing
            }
            else if (line.startsWith('{')) {
                // start of block
                line = line.substr(1).trim();
                // close current unstructured output (if any)
                if (currEntry.type === 'out') {
                    currEntry = logEntries.pop();
                }
                let newEntry = {type: 'block', children: []};
                newEntry.attr = line.trim();
                // remove the surrounding parenthesis if there is one
                if (newEntry.attr.charAt(0) === '(' &&
                    newEntry.attr.charAt(newEntry.attr.length-1) === ')') {
                    newEntry.attr = newEntry.attr.substr(1, newEntry.attr.length-2);
                }
                _addChild(newEntry);
            }
            else if (line.startsWith('}')) {
                // end of block
                // close the nearest block
                while (currEntry.type !== 'block') {
                    currEntry = logEntries.pop();
                }
                currEntry = logEntries.pop();
                // close the entry containing the block
                currEntry = logEntries.pop();
            }
            else {
                // start of some structured entry
                // close the nearest block
                while (currEntry.type !== 'block') {
                    currEntry = logEntries.pop();
                }
                let newEntry = {type: line.trim(), children: []};
                _addChild(newEntry);
            }
        }
        else {
            // unstructured output
            if (currEntry.type !== 'out') {
                let newEntry = {type: 'out', children: [], lines:[]};
                _addChild(newEntry);
            }
            currEntry.lines.push(line);
        }
    }
}


function _getChildrenOfType(startNode, type) {
    let matchedNodes = [];
    for (let nodeIdx in startNode.children) {
        let node = startNode.children[nodeIdx];
        if (node.type === type) {
            matchedNodes.push(node);
        }
    }
    return matchedNodes;
}


function updateTaskList() {
    try {
        let nodeNode = _getChildrenOfType(parsedLog.children[0], 'node')[0];
        nodeNode = _getChildrenOfType(nodeNode, 'block')[0];
        let nodesStage = _getChildrenOfType(nodeNode, 'stage');
        let stages = [];
        let stageStatus = null;
        for (let nodeIdx in nodesStage) {
            let node = nodesStage[nodeIdx];
            let n = _getChildrenOfType(node, 'block')[0];
            let stage = {fullname: n.attr};
            let fullnameMatch = stage.fullname.match(/^(.*) \[.*\]$/);

            if (stage.fullname === 'summary') {
                try {
                    console.log(node);
                    node = node.children[0].children[0].children[0];
                    let stageStatusList = JSON.parse(node.lines[0]);
                    stageStatus = {};
                    for (let stageStatusListIdx in stageStatusList) {
                        let s = stageStatusList[stageStatusListIdx];
                        stageStatus[s[0]] = s[1];
                    }
                } catch (err) {
                    stageStatus = null;
                }
            }
            else {
                stage.name = fullnameMatch? fullnameMatch[1]: stage.fullname;
                stages.push(stage);
            }
        }
        $('#task-panel').html('<div id="task-list" class="list-group"></div>');
        for (let stageIdx in stages) {
            let stage = stages[stageIdx];
            let stageElmHtml = '<a class="list-group-item" data-task-fullname="' + stage.fullname + '" onclick="onClickTaskBtn(this)">' + stage.name + '</a>';
            if (currTask === stage.fullname) {
                stageElmHtml = stageElmHtml.replace('<a class="', '<a class="active ');
            }
            if (stageStatus && stageStatus[stage.fullname]) {
                if (stageStatus[stage.fullname] === 'SUCCESS') {
                    stageElmHtml = stageElmHtml.replace('<a class="', '<a class="list-group-item-success ');
                }
                else if (stageStatus[stage.fullname] === 'FAILURE') {
                    stageElmHtml = stageElmHtml.replace('<a class="', '<a class="list-group-item-danger ');
                }
            }
            $('#task-list').append(stageElmHtml);
        }
    } catch (err) {
        console.error(err);
        $('#task-panel').html('');
    }
}


function onClickTaskBtn(taskElm) {
    let taskFullname = $(taskElm).data('taskFullname');
    if (currTask !== taskFullname) {
        $('#task-list a').removeClass('active');
        $(taskElm).addClass('active');
        currTask = taskFullname;
        showRunTaskLog(taskFullname);
    }
}


function showRunTaskLog(taskFullname) {
    try {
        let nodeNode = _getChildrenOfType(parsedLog.children[0], 'node')[0];
        nodeNode = _getChildrenOfType(nodeNode, 'block')[0];
        let nodesStage = _getChildrenOfType(nodeNode, 'stage');
        let stageFound = false;
        for (let nodeIdx in nodesStage) {
            let node = nodesStage[nodeIdx];
            let nodeStageBlock = _getChildrenOfType(node, 'block')[0];
            if (nodeStageBlock.attr !== taskFullname) continue;
            stageFound = true;
            $('#log-panel').html('<div id="log-inner-container" class="panel-group"></div>');
            consoleElementCnt = 0;
            for (let subnodeIdx in nodeStageBlock.children) {
                let subnode = nodeStageBlock.children[subnodeIdx];
                $('#log-inner-container').append(_buildConsoleElement(subnode));
            }
        }
        if (!stageFound) {
            $('#log-panel').html('No log found for this task.');
        }
    } catch (err) {
        console.error(err);
        $('#log-panel').html('');
    }
}


function _buildConsoleElement(elm) {
    let elmId = consoleElementCnt++;
    let elmHtml = '';
    let elmHeader = '';
    let elmInnerHtml = '';

    if (elm.children && elm.children.length > 0) {
        elmHeader = elm.type;
        for (let subnodeIdx in elm.children) {
            let subnode = elm.children[subnodeIdx];
            if (subnode.type === 'block' && subnode.attr) {
                elmHeader += (' ' + subnode.attr);
            }
            elmInnerHtml += _buildConsoleElement(subnode);
        }
        elmHtml = '<div class="panel panel-default">' +
            '<div class="panel-heading"><h4 class="panel-title">' +
            '<a data-toggle="collapse" href="#elm-' + elmId + '">' + elmHeader + '</a></h4></div>' +
            '<div id="elm-' + elmId + '" class="panel-collapse collapse">' +
            '<div class="panel-body">' + elmInnerHtml + '</div></div></div>';
    }
    else if (elm.type === 'out') {
        elmHtml = elm.lines.join('<br />');
    }
    else if (elm.type === 'block') {
        // do nothing for blocks without children
    }
    else {
        elmHeader = elm.type;
        elmInnerHtml = '';
        elmHtml = '<div class="panel panel-default">' +
            '<div class="panel-heading"><h4 class="panel-title">' +
            '<a data-toggle="collapse" href="#elm-' + elmId + '">' + elmHeader + '</a></h4></div>' +
            '<div id="elm-' + elmId + '" class="panel-collapse collapse">' +
            '<div class="panel-body">' + elmInnerHtml + '</div></div></div>';
    }
    return elmHtml;
}